import { Controller, Body, UseGuards, Post, Get, Request, Put, Query, Delete, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
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
    @ApiBearerAuth()
    @ApiOperation({ 
        summary: 'Criar cupom de desconto',
        description: 'Cria um novo cupom de desconto. Pode ser global (para todos os eventos) ou específico para um evento. Apenas Owners e Promoters podem criar cupons.'
    })
    @ApiBody({ 
        type: CupomBody,
        description: 'Dados do cupom a ser criado'
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Cupom criado com sucesso',
        schema: {
            type: 'object',
            properties: {
                cupom: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        code: { type: 'string' },
                        descont_percent: { type: 'number' },
                        discount_value: { type: 'number' },
                        quantity_available: { type: 'number' },
                        expires_at: { type: 'string', format: 'date-time' },
                        event_id: { type: 'string', nullable: true },
                        user_uid: { type: 'string' },
                        description: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Dados inválidos' })
    @ApiResponse({ status: 401, description: 'Não autorizado' })
    @ApiResponse({ status: 403, description: 'Sem permissão para criar cupons' })
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
    @ApiBearerAuth()
    @ApiOperation({ 
        summary: 'Atualizar cupom de desconto',
        description: 'Atualiza um cupom de desconto existente. Apenas o criador do cupom pode editá-lo.'
    })
    @ApiQuery({ 
        name: 'id', 
        description: 'ID do cupom a ser atualizado',
        type: 'string'
    })
    @ApiBody({ 
        type: UpdateBody,
        description: 'Dados do cupom a ser atualizado'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Cupom atualizado com sucesso',
        schema: {
            type: 'string',
            example: 'sucesso'
        }
    })
    @ApiResponse({ status: 400, description: 'Dados inválidos' })
    @ApiResponse({ status: 401, description: 'Não autorizado' })
    @ApiResponse({ status: 403, description: 'Sem permissão para editar este cupom' })
    @ApiResponse({ status: 404, description: 'Cupom não encontrado' })
    async update(@Query() query, @Request() req, @Body() body: UpdateBody) {
        const { userId: useruid } = req.user
        const id = typeof query === 'object' && query.id ? query.id : query;
        
        const { code, descont_percent, discount_value, quantity_available, description, eventId, expiresAt } = body

        await this.updateCupom.execute({
            id,
            code,
            descont_percent,
            discount_value,
            quantity_available,
            description,
            eventId,
            expiresAt
        })

        await this.createCupomAudit.execute({
            useruid,
            modificationType: "UPDATECUPOM",
            details: { code, descont_percent, quantity_available },
            entityId: id
        }).catch(console.error)

        return 'sucesso'
    }

    @UseGuards(JwtAuthGuard, CanUpdateCuponsGuard)
    @Delete("delete/:id")
    @ApiBearerAuth()
    @ApiOperation({ 
        summary: 'Deletar cupom de desconto',
        description: 'Remove um cupom de desconto. Apenas o criador do cupom pode deletá-lo.'
    })
    @ApiParam({ 
        name: 'id', 
        description: 'ID do cupom a ser deletado',
        type: 'string'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Cupom deletado com sucesso',
        schema: {
            type: 'string',
            example: 'sucesso'
        }
    })
    @ApiResponse({ status: 401, description: 'Não autorizado' })
    @ApiResponse({ status: 403, description: 'Sem permissão para deletar este cupom' })
    @ApiResponse({ status: 404, description: 'Cupom não encontrado' })
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
    @ApiBearerAuth()
    @ApiOperation({ 
        summary: 'Vincular cupom a ticket',
        description: 'Vincula um cupom de desconto a um ticket específico. Apenas managers do evento podem realizar esta operação.'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                cupomId: {
                    type: 'string',
                    description: 'ID do cupom a ser vinculado',
                    example: 'cupom-123'
                },
                ticketId: {
                    type: 'string',
                    description: 'ID do ticket ao qual o cupom será vinculado',
                    example: 'ticket-456'
                }
            },
            required: ['cupomId', 'ticketId']
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Cupom vinculado com sucesso',
        schema: {
            type: 'string',
            example: 'sucesso'
        }
    })
    @ApiResponse({ status: 401, description: 'Não autorizado' })
    @ApiResponse({ status: 403, description: 'Sem permissão para gerenciar este evento' })
    @ApiResponse({ status: 404, description: 'Cupom ou ticket não encontrado' })
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
    @ApiBearerAuth()
    @ApiOperation({ 
        summary: 'Desvincular cupom de ticket',
        description: 'Remove a vinculação entre um cupom de desconto e um ticket. Apenas managers do evento podem realizar esta operação.'
    })
    @ApiParam({ 
        name: 'eventId', 
        description: 'ID do evento',
        type: 'string'
    })
    @ApiQuery({ 
        name: 'cupomId', 
        description: 'ID do cupom a ser desvinculado',
        type: 'string'
    })
    @ApiQuery({ 
        name: 'ticketId', 
        description: 'ID do ticket do qual o cupom será desvinculado',
        type: 'string'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Cupom desvinculado com sucesso',
        schema: {
            type: 'string',
            example: 'sucesso'
        }
    })
    @ApiResponse({ status: 401, description: 'Não autorizado' })
    @ApiResponse({ status: 403, description: 'Sem permissão para gerenciar este evento' })
    @ApiResponse({ status: 404, description: 'Cupom ou ticket não encontrado' })
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
    @ApiBearerAuth()
    @ApiOperation({ 
        summary: 'Buscar cupom por código',
        description: 'Busca um cupom específico pelo código, ticket e evento.'
    })
    @ApiQuery({ 
        name: 'ticketId', 
        description: 'ID do ticket',
        type: 'string'
    })
    @ApiQuery({ 
        name: 'code', 
        description: 'Código do cupom',
        type: 'string'
    })
    @ApiQuery({ 
        name: 'eventId', 
        description: 'ID do evento (opcional para cupons globais)',
        type: 'string',
        required: false
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Cupom encontrado',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                code: { type: 'string' },
                descont_percent: { type: 'number' },
                discount_value: { type: 'number' },
                quantity_available: { type: 'number' },
                expires_at: { type: 'string', format: 'date-time' },
                event_id: { type: 'string', nullable: true },
                user_uid: { type: 'string' },
                description: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Não autorizado' })
    @ApiResponse({ status: 404, description: 'Cupom não encontrado' })
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
    @ApiBearerAuth()
    @ApiOperation({ 
        summary: 'Buscar cupons por ticket',
        description: 'Lista todos os cupons associados a um ticket específico. Apenas managers do evento podem acessar.'
    })
    @ApiQuery({ 
        name: 'ticketId', 
        description: 'ID do ticket',
        type: 'string'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Lista de cupons encontrados',
        schema: {
            type: 'object',
            properties: {
                cupons: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            code: { type: 'string' },
                            descont_percent: { type: 'number' },
                            discount_value: { type: 'number' },
                            quantity_available: { type: 'number' },
                            expires_at: { type: 'string', format: 'date-time' },
                            event_id: { type: 'string', nullable: true },
                            user_uid: { type: 'string' },
                            description: { type: 'string' },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Não autorizado' })
    @ApiResponse({ status: 403, description: 'Sem permissão para acessar este ticket' })
    async findByTicketId(@Query() ticketId) {

        const { cupons } = await this.findByTicket.execute({
            ticketId
        })

        return { cupons: cupons.map(CupomViewModel.toHTTP) }
    }

    @UseGuards(JwtAuthGuard)
    @Get('findAllByUser')
    @ApiBearerAuth()
    @ApiOperation({ 
        summary: 'Buscar cupons do usuário',
        description: 'Lista todos os cupons criados pelo usuário logado. Para Owners, mostra apenas cupons de eventos que eles criaram. Para Promoters, mostra cupons de eventos que eles criaram.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Lista de cupons do usuário',
        schema: {
            type: 'object',
            properties: {
                cupons: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            code: { type: 'string' },
                            descont_percent: { type: 'number' },
                            discount_value: { type: 'number' },
                            quantity_available: { type: 'number' },
                            expires_at: { type: 'string', format: 'date-time' },
                            event_id: { type: 'string', nullable: true },
                            eventName: { type: 'string' },
                            user_uid: { type: 'string' },
                            description: { type: 'string' },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Não autorizado' })
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
          // Owners: buscar apenas eventos criados por eles (não todos os eventos do estabelecimento)
          const events = await this.prisma.event.findMany({
            where: { useruid: userId },
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