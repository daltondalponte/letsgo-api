import { Controller, Body, UseGuards, Post, Get, Put, Request, Param, BadRequestException, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTicket } from '@application/ticket/use-cases/create-ticket';
import { FindTicketsByEvent } from '@application/ticket/use-cases/find-many-by-event';
import { TicketBody } from '../dtos/ticket/create-ticket-body';
import { TicketViewModel } from '../view-models/ticket/ticket-view-model';
import { CreateTicketPurchase } from '@application/ticket/use-cases/create-ticket-purchase';
import { CreatePayment } from '@application/payment/use-cases/create-payment';
import { FindTicketPurchase } from '@application/ticket/use-cases/find-ticket-purchase';
import { UpdateTicket } from '@application/ticket/use-cases/update-ticket';
import { FindTicketPurchasebyId } from '@application/ticket/use-cases/find-ticket-purchase-by-id';
import { ConferredTicketPurchase } from '@application/ticket/use-cases/conferred-ticket-sale';
import { StripeService } from '@infra/payment/stripe.service';
import { FindTicketByIdWithDetails } from '@application/ticket/use-cases/find-ticket-with-details';
import { FirebaseService } from '@infra/database/firebase/firebase.service';
import { CreateTicketAudit } from '@application/audit-entity/use-cases/ticket/create-ticket-audit';
import { CupomViewModel } from '../view-models/cupom/cupom-view-model';
import { EnsureManagerEvent } from '../auth/guards/ensure-manage-event.guard';
import { Cupom } from '@application/cupom/entity/Cupom';
import { UpdatePayment } from '@application/payment/use-cases/update-payment';
import { PaymentStatus } from '@application/payment/entity/Payment';
import { FindTicketsByEventAdmin } from '@application/ticket/use-cases/find-many-by-event-to-admin';
import { CanUpdateticketsGuard } from '../auth/guards/ticket/can-update-tickets.guard';
import { CanInsertTicketsGuard } from '../auth/guards/ticket/can-insert-tickets.guard';

@ApiTags('Ticket')
@Controller("ticket")
export class TicketController {

    constructor(
        private createTicket: CreateTicket,
        private updateTicket: UpdateTicket,
        private createTicketPurchase: CreateTicketPurchase,
        private findManyByEvent: FindTicketsByEvent,
        private findManyByEventToAdmin: FindTicketsByEventAdmin,
        private createPayment: CreatePayment,
        private findTicketPurchase: FindTicketPurchase,
        private findTicketPurchasebyId: FindTicketPurchasebyId,
        private findTicketByIdWithDetails: FindTicketByIdWithDetails,
        private conferredTicketPurchase: ConferredTicketPurchase,
        private stripeService: StripeService,
        private firebase: FirebaseService,
        private createTicketAudit: CreateTicketAudit,
        private updatePayment: UpdatePayment
    ) { }

    @UseGuards(JwtAuthGuard, CanInsertTicketsGuard)
    @Post("create")
    async create(@Request() req, @Body() body: TicketBody) {
        const { userId: useruid } = req.user

        const { description, eventId, price, quantity_available } = body

        const { ticket } = await this.createTicket.execute(
            {
                useruid,
                description,
                eventId,
                price,
                quantity_available
            }
        )

        await this.createTicketAudit.execute({
            useruid,
            modificationType: "CREATETICKET",
            details: { description, eventId, price, quantity_available },
            entityId: ticket.id

        }).catch(console.error)

        return { ticket: TicketViewModel.toHTTP(ticket) }
    }

    @UseGuards(JwtAuthGuard, CanUpdateticketsGuard)
    @Put("update/:id")
    async update(@Param('id') ticketId: string, @Request() req, @Body() body: any) {
        const { userId: useruid } = req.user

        const { eventId, price, quantity_available } = body

        const { ticket } = await this.updateTicket.execute(
            {
                useruid,
                id: ticketId,
                eventId,
                price,
                quantity_available
            }
        )

        await this.createTicketAudit.execute({
            useruid,
            modificationType: "UPDATETICKET",
            details: { eventId, price, quantity_available },
            entityId: ticket.id
        }).catch(console.error)

        await this.firebase.firestoreMakeAnUpdate("event", { eventId }).catch(console.error)

        return { ticket: TicketViewModel.toHTTP(ticket) }
    }

    @UseGuards(JwtAuthGuard)
    @Post("purchase-ticket/:id")
    async createPurchase(@Param('id') ticketId: string, @Query("code") code, @Request() req) {
        const { userId: useruid } = req.user

        const { customerId, deviceToken } = req.query

        const { ticket } = await this.findTicketByIdWithDetails.execute({ id: ticketId })

        const { payment } = await this.createPayment.execute({ ticketId, useruid })

        let totalAmount: number;
        const payloadPurchase: any = {
            paymentId: payment.id,
            ticketId,
            userId: useruid
        }

        if (code && ticket.TicketCupons?.map(c => c.cupom?.code).includes(code)) {
            const finded = ticket.TicketCupons?.find(c => c.cupom?.code === code)

            //Verificar se cupom expirou
            if (new Date(new Date().toISOString().substring(0, 10)) > new Date(finded.expiresAt)) {
                totalAmount = payment.amount
                return
            }

            payloadPurchase.cupomId = finded?.cupom?.id
            let discountedValue: number

            if (finded?.cupom?.descont_percent) {
                discountedValue = payment.amount * (1 - finded?.cupom?.descont_percent / 100);
            } else {
                discountedValue = payment.amount - finded.cupom?.discount_value
            }

            if (discountedValue < 0) {
                totalAmount = 0
            } else {
                totalAmount = discountedValue
            }

        } else {
            totalAmount = payment.amount
        }

        const id = await this.createTicketPurchase.execute(payloadPurchase)

        const paymentId = payment.id
        const purchaseId = id

        const amount = Math.round(parseFloat(String(Number(totalAmount))) * 100)
        const destination = ticket.event.user.stripeAccountId

        const tax = amount * 8 / 100

        if (amount === 0) {
            await this.updatePayment.execute({ paymentId: paymentId, status: PaymentStatus.COMPLETED })
            return { id }
        }

        const { ephemeralKey, paymentIntent } = await this.stripeService.createPaymentIntent(amount, tax, destination, purchaseId, paymentId, customerId, deviceToken)

        return { id, ephemeralKey, paymentIntent }
    }

    @UseGuards(JwtAuthGuard)
    @Get("purchase-ticket")
    async findPurchases(@Request() req) {
        const { userId } = req.user

        const { tickets } = await this.findTicketPurchase.execute({ userId })

        return { tickets }
    }


    @UseGuards(JwtAuthGuard)
    @Put("conferred-purchase/:id")
    async conferredTicketSale(@Param('id') ticketSaleId: string, @Request() req) {
        const { userId: useruid } = req.user

        await this.conferredTicketPurchase.execute({ id: ticketSaleId })

        return { message: "sucesso" }
    }

    @UseGuards(JwtAuthGuard)
    @Get("purchase-ticket-for-taker/:id")
    async findPurchaseById(@Param('id') id, @Request() req) {
        const { userId } = req.user
        const { eventId } = req.query

        const { ticket } = await this.findTicketPurchasebyId.execute({ id })

        if (ticket?.ticket?.event?.id !== eventId || !ticket?.id) {
            throw new BadRequestException("Bilhete não é válido para este evento!")
        }

        // if (ticket.payment.status === "PENDING") {
        //     throw new BadRequestException("Bilhete não é válido!")
        // }

        return { ticket }
    }


    @UseGuards(JwtAuthGuard, EnsureManagerEvent)
    @Get("find-by-event/:eventId")
    async findByEvent(@Param('eventId') eventId, @Request() req) {

        const { tickets } = await this.findManyByEvent.execute({ eventId })

        return {
            tickets: tickets.map(t => ({
                id: t._id,
                description: t.props.description,
                eventId: t.props.eventId,
                price: t.props.price,
                quantity_available: t.props.quantity_available,
                createdAt: t.props.createdAt,
                updatedAt: t.props.updatedAt,
                cupons: t.cupons.map(c => CupomViewModel.toHTTP(new Cupom(c, c.id)))
            }))
        }
    }

    @UseGuards(JwtAuthGuard, EnsureManagerEvent)
    @Get("admin/find-by-event/:eventId")
    async findByEventAdmin(@Param('eventId') eventId, @Request() req) {

        const { tickets } = await this.findManyByEventToAdmin.execute({ eventId })

        return {
            tickets: tickets.map(t => {
                return {
                    id: t._id,
                    description: t.props.description,
                    eventId: t.props.eventId,
                    price: t.props.price,
                    quantity_available: t.props.quantity_available,
                    createdAt: t.props.createdAt,
                    updatedAt: t.props.updatedAt,
                    cupons: t.cupons.map(c => CupomViewModel.toHTTP(new Cupom(c, c.id))),
                    sales: t.sales.map(s => ({ ...s, event: t.event }))
                }
            })
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get("personal/find-by-event/:eventId")
    async findByEventAndPersonalUser(@Param('eventId') eventId, @Request() req) {

        const { tickets } = await this.findManyByEvent.execute({ eventId })

        return {
            tickets: tickets.map(t => ({
                id: t._id,
                description: t.props.description,
                eventId: t.props.eventId,
                price: t.props.price,
                quantity_available: t.props.quantity_available,
                createdAt: t.props.createdAt,
                updatedAt: t.props.updatedAt
            }))
        }
    }
}