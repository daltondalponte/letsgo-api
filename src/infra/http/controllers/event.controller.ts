import { CreateEvent } from '@application/event/use-cases/create-event';
import { FindEventsByUserUidOrEstablishmentId } from '@application/event/use-cases/find-many-by-user';
import { Controller, Body, UseGuards, Post, Get, Request, Param } from '@nestjs/common';
import { EventBody } from '../dtos/event/create-event-body';
import { EventViewModel } from '../view-models/event/event-view-model';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { CreateManyTickets } from '@application/ticket/use-cases/create-many-tickets';
import { UpdateEvent } from '@application/event/use-cases/update-event';
import { UpdateEventListNames } from '@application/event/use-cases/update-event-list-names';
import { UpdateEventTakers } from '@application/event/use-cases/update-event-takers';
import { FindTicketTakerByUserTakerId } from '@application/ticketTaker/use-cases/find-by-user-taker';
import { FindEstablishmentByUserUid } from '@application/establishment/use-cases/find-many-by-user';
import { CreateEventAudit } from '@application/audit-entity/use-cases/event/create-event-audit';
import { EnsureProfessionalUser } from '../auth/guards/ensure-professional-user.guard';
import { EnsureManagerEvent } from '../auth/guards/ensure-manage-event.guard';
import { FindEstablishmentById } from '@application/establishment/use-cases/find-many-by-id';
import { FirebaseService } from '@infra/database/firebase/firebase.service';
import { EnsureOwnerEstablishment } from '../auth/guards/ensure-owner-establishment.guard';
import { CreateEventApproval } from '@application/event-manager/use-cases/create-event-approval';

@ApiTags("Evento")
@Controller("event")
export class EventController {

    constructor(
        private createEvent: CreateEvent,
        private createManyTickets: CreateManyTickets,
        private findManyByUser: FindEventsByUserUidOrEstablishmentId,
        private updateEvent: UpdateEvent,
        private updateEventListNames: UpdateEventListNames,
        private updateEventTakers: UpdateEventTakers,
        private findTicketTakerByUserTakerId: FindTicketTakerByUserTakerId,
        private findEstablishmentByUserUid: FindEstablishmentByUserUid,
        private createEventAudit: CreateEventAudit,
        private findEstablishmentById: FindEstablishmentById,
        private createEventApproval: CreateEventApproval,
        private firebaseService: FirebaseService
    ) { }

    @UseGuards(JwtAuthGuard, EnsureProfessionalUser)
    @Post("create")
    async create(@Request() req, @Body() body: EventBody & { tickets: any[] }) {
        const { userId: useruid, username } = req.user

        const { dateTimestamp, description, establishmentId, photos, tickets, name } = body

        let isActive = true
        const { establishment, userOwner } = await this.findEstablishmentById.execute({
            id: establishmentId
        })

        if (establishment.userOwnerUid !== useruid) {
            isActive = false
            const deviceToken = userOwner?.deviceToken
            const title = "Nova solicitação de evento no seu estabelecimento"
            const body = `${username} deseja realizar um evento em seu estabelecimento`
            const navigationTo = "events-manage"
            await this.firebaseService
                .sendNotification(title, body, deviceToken, navigationTo)
                .catch(console.error)
        }

        const { event } = await this.createEvent.execute(
            {
                useruid,
                name,
                dateTimestamp,
                description,
                establishmentId,
                isActive,
                photos
            }
        )

        await this.createEventAudit.execute({
            useruid,
            modificationType: "CREATEEVENT",
            details: { dateTimestamp, description, establishmentId, tickets, photos, name },
            entityId: event.id
        }).catch(console.error)

        if (tickets.length > 0) {
            await this.createManyTickets.execute({
                eventId: event.id,
                tickets
            }).catch(console.error)
        }

        return { event: EventViewModel.toHTTP(event) }
    }

    @UseGuards(JwtAuthGuard, EnsureManagerEvent)
    @Post("update/:eventId")
    async update(@Param('eventId') eventId, @Request() req, @Body() body: EventBody & { tickets: any[] }) {
        const { userId: useruid } = req.user

        const { description, photos, name, establishmentId } = body

        const { event } = await this.updateEvent.execute(
            {
                establishmentId,
                id: eventId,
                name,
                description,
                photos
            }
        )

        await this.createEventAudit.execute({
            useruid,
            modificationType: "UPDATEEVENT",
            details: { description, photos, name, establishmentId },
            entityId: event.id
        }).catch(console.error)

        return { event: EventViewModel.toHTTP(event) }
    }

    @UseGuards(JwtAuthGuard, EnsureOwnerEstablishment)
    @Post("update/:eventId/create-approval")
    async active(@Param('eventId') eventId, @Request() req, @Body() body: any) {
        const { userId: useruid } = req.user

        const { status } = body

        await this.createEventApproval.execute(
            {
                useruid,
                status,
                eventId
            }
        )

        return "sucesso"
    }


    @UseGuards(JwtAuthGuard, EnsureManagerEvent)
    @Post("update-list-names/:eventId")
    async updateListNames(@Param('eventId') eventId, @Request() req, @Body() body: any) {
        const { userId: useruid } = req.user

        const { listNames, establishmentId } = body


        await this.updateEventListNames.execute(
            {
                establishmentId,
                id: eventId,
                listNames
            }
        )

        return { success: true }
    }

    @UseGuards(JwtAuthGuard)
    @Post("update-event-takers/:id")
    async updateEventTTakers(@Param('id') id, @Request() req, @Body() body: any) {
        const { userId: useruid } = req.user

        const { ticketTakers, establishmentId } = body

        await this.updateEventTakers.execute(
            {
                establishmentId,
                id,
                ticketTakers
            }
        )

        return { success: true }
    }


    @UseGuards(JwtAuthGuard)
    @Get("find-many-by-user/:id")
    async findEventsByUserUidOrEstablishmentId(@Param('id') establishmentId) {

        const { events } = await this.findManyByUser.execute({ establishmentId })

        return {
            events: events.map(e => {
                return {
                    id: e._id,
                    description: e.props.description,
                    name: e.props.name,
                    dateTimestamp: e.props.dateTimestamp,
                    isActive: e.props.isActive,
                    establishmentId: e.props.establishmentId,
                    photos: e.props.photos,
                    useruid: e?.props?.useruid,
                    coordinates_event: e.props.coord,
                    ticketTakers: e.props.ticketTakers,
                    listNames: e.props.listNames,
                    createdAt: e.props.createdAt,
                    updatedAt: e.props.updatedAt,
                    eventApprovals: e?.eventApprovals,
                    establishment: e?.establishment
                }
            })
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get("find-many-by-taker/:email")
    async findEventsByTaker(@Param('email') email, @Request() req) {
        const { userId: useruid } = req.user

        const { ticketTaker } = await this.findTicketTakerByUserTakerId.execute({ id: useruid })
        const { establishment } = await this.findEstablishmentByUserUid.execute({ useruid: ticketTaker.userOwnerUid })
        const { events } = await this.findManyByUser.execute({ establishmentId: establishment.id })

        const eventsForTaker = events
            .filter(e => e.ticketTakers.includes(email))

        return { events: eventsForTaker.map(EventViewModel.toHTTP) }
    }
}