import { Controller, Body, UseGuards, Post, Get, Request, Put, Query, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { CreateCupom } from '@application/cupom/use-cases/create-cupom';
import { UpdateCupom } from '@application/cupom/use-cases/update-cupom';
import { FindCuponsByTicketId } from '@application/cupom/use-cases/find-by-ticket';
import { FindCuponsByTicketIdAndCode } from '@application/cupom/use-cases/find-by-ticket-and-code';
import { CupomBody } from '../dtos/cupom/cupom-body';
import { CupomViewModel } from '../view-models/cupom/cupom-view-model';
import { CanInsertCuponsGuard } from '../auth/guards/cupom/can-insert-cupons.guard';
import { CanUpdateCuponsGuard } from '../auth/guards/cupom/can-update-cupons.guard';
import { EnsureManagerEvent } from '../auth/guards/ensure-manage-event.guard';
import { UpdateBody } from '../dtos/cupom/update-body';
import { CreateCupomAudit } from '@application/audit-entity/use-cases/cupom/create-cupom-audit';

@ApiTags("Cupom")
@Controller("cupom")
export class CupomController {

    constructor(
        private createCupom: CreateCupom,
        private updateCupom: UpdateCupom,
        private findByTicket: FindCuponsByTicketId,
        private findByTicketAndCode: FindCuponsByTicketIdAndCode,
        private createCupomAudit: CreateCupomAudit
    ) { }

    @UseGuards(JwtAuthGuard, CanInsertCuponsGuard)
    @Post("create")
    async create(@Request() req, @Body() body: CupomBody) {
        const { userId: useruid } = req.user
        const { code, descont_percent, quantity_available, eventId, expiresAt, discont_value } = body
        
        const { cupom } = await this.createCupom.execute(
            {
                code,
                descont_percent,
                quantity_available,
                discont_value,
                eventId,
                expiresAt: new Date(expiresAt)
            }
        )

        await this.createCupomAudit.execute({
            useruid,
            modificationType: "CREATECUPOM",
            details: { code, descont_percent, quantity_available, eventId, discont_value },
            entityId: cupom.id

        }).catch(console.error)

        return { cupom: CupomViewModel.toHTTP(cupom) }
    }

    @UseGuards(JwtAuthGuard, CanUpdateCuponsGuard)
    @Put("update")
    async update(@Query() id, @Request() req, @Body() body: UpdateBody) {
        const { userId: useruid } = req.user
        const { code, descont_percent, quantity_available } = body

        await this.updateCupom.execute({
            id,
            code,
            descont_percent,
            quantity_available
        })

        await this.createCupomAudit.execute({
            useruid,
            modificationType: "CREATECUPOM",
            details: { code, descont_percent, quantity_available },
            entityId: id
        }).catch(console.error)

        return 'sucesso'
    }

    @UseGuards(JwtAuthGuard, EnsureManagerEvent)
    @Post("attachTicket")
    async attachTicket(@Request() req, @Body() body: any) {
        const { userId: useruid } = req.user
        const { cupomId, ticketId } = body

        await this.createCupomAudit.execute({
            useruid,
            modificationType: "ATTACHCUPOM",
            details: { cupomId, ticketId },
            entityId: cupomId
        }).catch(console.error)

        return 'sucesso'
    }

    @UseGuards(JwtAuthGuard, EnsureManagerEvent)
    @Delete("dettachTicket/:eventId")
    async dettachTicket(@Query() query, @Request() req) {
        const { userId: useruid } = req.user
        const { cupomId, ticketId } = query

        await this.createCupomAudit.execute({
            useruid,
            modificationType: "DETTACHCUPOM",
            details: { cupomId, ticketId },
            entityId: cupomId
        }).catch(console.error)

        return 'sucesso'
    }

    @UseGuards(JwtAuthGuard)
    @Get("findOneByCode")
    async findByCodeAndTicketId(@Query() query) {

        const {
            ticketId,
            code,
            eventId
        } = query

        const { cupom } = await this.findByTicketAndCode.execute({
            ticketId,
            code,
            eventId
        })

        return CupomViewModel.toHTTP(cupom)
    }

    @UseGuards(JwtAuthGuard, EnsureManagerEvent)
    @Get("findAllByTicket")
    async findByTicketId(@Query() ticketId) {

        const { cupons } = await this.findByTicket.execute({
            ticketId
        })

        return { cupons: cupons.map(CupomViewModel.toHTTP) }
    }

}