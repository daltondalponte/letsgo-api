import { Controller, Body, UseGuards, Post, Get, Request, Put, Query, Delete, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { CreateCupom } from '@application/cupom/use-cases/create-cupom';
import { UpdateCupom } from '@application/cupom/use-cases/update-cupom';
import { DeleteCupom } from '@application/cupom/use-cases/delete-cupom';
import { FindCuponsByTicketId } from '@application/cupom/use-cases/find-by-ticket';
import { FindCuponsByTicketIdAndCode } from '@application/cupom/use-cases/find-by-ticket-and-code';
import { CupomBody } from '../dtos/cupom/cupom-body';
import { CupomViewModel } from '../view-models/cupom/cupom-view-model';
import { CanInsertCuponsGuard } from '../auth/guards/cupom/can-insert-cupons.guard';
import { CanUpdateCuponsGuard } from '../auth/guards/cupom/can-update-cupons.guard';
import { EnsureManagerEvent } from '../auth/guards/ensure-manage-event.guard';
import { UpdateBody } from '../dtos/cupom/update-body';
import { CreateCupomAudit } from '@application/audit-entity/use-cases/cupom/create-cupom-audit';
import { PrismaService } from '@infra/database/prisma/prisma.service';

@ApiTags("Cupom")
@Controller("cupom")
export class CupomController {

    constructor(
        private createCupom: CreateCupom,
        private updateCupom: UpdateCupom,
        private deleteCupom: DeleteCupom,
        private findByTicket: FindCuponsByTicketId,
        private findByTicketAndCode: FindCuponsByTicketIdAndCode,
        private createCupomAudit: CreateCupomAudit,
        private prisma: PrismaService
    ) { }

    @UseGuards(JwtAuthGuard, CanInsertCuponsGuard)
    @Post("create")
    async create(@Request() req, @Body() body: CupomBody) {
        const { userId: useruid } = req.user
        const { code, descont_percent, quantity_available, eventId, expiresAt, discount_value, description } = body
        
        const { cupom } = await this.createCupom.execute(
            {
                code,
                descont_percent,
                quantity_available,
                discount_value,
                eventId,
                useruid,
                expiresAt: new Date(expiresAt),
                description
            }
        )

        await this.createCupomAudit.execute({
            useruid,
            modificationType: "CREATECUPOM",
            details: { code, descont_percent, quantity_available, eventId, discount_value },
            entityId: cupom.id

        }).catch(console.error)

        return { cupom: CupomViewModel.toHTTP(cupom) }
    }

    @UseGuards(JwtAuthGuard, CanUpdateCuponsGuard)
    @Put("update")
    async update(@Query() query, @Request() req, @Body() body: UpdateBody) {
        const { userId: useruid } = req.user
        const id = typeof query === 'object' && query.id ? query.id : query;
        
        // DEBUG: Log do que está chegando
        console.log('=== DEBUG UPDATE CUPOM ===');
        console.log('query original:', query);
        console.log('id extraído:', id);
        console.log('body completo:', body);
        console.log('body.eventId:', body.eventId);
        console.log('typeof body.eventId:', typeof body.eventId);
        
        const { code, descont_percent, discount_value, quantity_available, description, eventId } = body

        await this.updateCupom.execute({
            id,
            code,
            descont_percent,
            discount_value,
            quantity_available,
            description,
            eventId
        })

        await this.createCupomAudit.execute({
            useruid,
            modificationType: "CREATECUPOM",
            details: { code, descont_percent, quantity_available },
            entityId: id
        }).catch(console.error)

        return 'sucesso'
    }

    @UseGuards(JwtAuthGuard, CanUpdateCuponsGuard)
    @Delete("delete/:id")
    async delete(@Param('id') id: string, @Request() req) {
        const { userId: useruid } = req.user

        await this.deleteCupom.execute({
            id
        })

        await this.createCupomAudit.execute({
            useruid,
            modificationType: "UPDATECUPOM",
            details: { cupomId: id, action: "DELETE" },
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

    @UseGuards(JwtAuthGuard)
    @Get('findAllByUser')
    async findAllByUser(@Request() req) {
      const { userId, type } = req.user;
      
      let cupons = [];

      if (type === 'PROFESSIONAL_PROMOTER' || type === 'PROFESSIONAL_OWNER') {
        let eventIds = [];
        
        if (type === 'PROFESSIONAL_PROMOTER') {
          // Promoters: buscar eventos criados por eles
          const events = await this.prisma.event.findMany({
            where: { useruid: userId },
            select: { id: true, name: true }
          });
          eventIds = events.map(e => e.id);
        } else if (type === 'PROFESSIONAL_OWNER') {
          // Owners: buscar eventos do seu estabelecimento
          const establishments = await this.prisma.establishment.findMany({
            where: { userOwnerUid: userId },
            select: { id: true }
          });
          const establishmentIds = establishments.map(e => e.id);
          
          const events = await this.prisma.event.findMany({
            where: { establishmentId: { in: establishmentIds } },
            select: { id: true, name: true }
          });
          eventIds = events.map(e => e.id);
        }
        
        // Buscar cupons de eventos específicos
        const eventSpecificCupons = await this.prisma.cupom.findMany({
          where: {
            eventId: { in: eventIds }
          },
          include: { event: true }
        });
        
        // Buscar cupons globais criados pelo usuário logado
        const globalCupons = await this.prisma.cupom.findMany({
          where: {
            eventId: null,
            useruid: userId
          },
          include: { event: true }
        });
        
        // Combinar os cupons
        cupons = [...eventSpecificCupons, ...globalCupons];
        
        // Adicionar nome do evento ao cupom
        cupons = cupons.map(c => ({
          ...c,
          eventName: c.event?.name || "Todos os eventos"
        }));
      }

      return { cupons };
    }

}