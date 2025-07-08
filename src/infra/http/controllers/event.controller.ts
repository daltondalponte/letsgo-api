import { Controller, Body, UseGuards, Post, Get, Request, Put, Param, Query, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateEvent } from '@application/event/use-cases/create-event';
import { FindEventsByUserUidOrEstablishmentId } from '@application/event/use-cases/find-many-by-user';
import { FindEventById } from '@application/event/use-cases/find-event-by-id';
import { UpdateEvent } from '@application/event/use-cases/update-event';
import { UpdateEventTakers } from '@application/event/use-cases/update-event-takers';
import { EventViewModel } from '../view-models/event/event-view-model';
import { ApiTags } from '@nestjs/swagger';
import { EnsureProfessionalUser } from '../auth/guards/ensure-professional-user.guard';
import { FindPendingApprovals } from '@application/event/use-cases/find-pending-approvals';
import { ApproveEvent } from '@application/event/use-cases/approve-event';
import { RejectEvent } from '@application/event/use-cases/reject-event';
import { UnauthorizedException } from '@nestjs/common';
import { FindEstablishmentById } from '@application/establishment/use-cases/find-many-by-id';
import { PrismaService } from '@infra/database/prisma/prisma.service';

@ApiTags("Evento")
@Controller("event")
export class EventController {

    constructor(
        private createEvent: CreateEvent,
        private findEventsByUserUidOrEstablishmentId: FindEventsByUserUidOrEstablishmentId,
        private findEventById: FindEventById,
        private updateEvent: UpdateEvent,
        private updateEventTakersUseCase: UpdateEventTakers,
        private findPendingApprovals: FindPendingApprovals,
        private approveEvent: ApproveEvent,
        private rejectEvent: RejectEvent,
        private findEstablishmentById: FindEstablishmentById,
        private prisma: PrismaService
    ) { }

    @UseGuards(JwtAuthGuard, EnsureProfessionalUser)
    @Post("create")
    async create(@Request() req, @Body() body: any) {
        const { userId: useruid, type } = req.user

        let { name, description, dateTimestamp, endTimestamp, duration, establishmentId, address, coordinates_event, photos = [], tickets = [] } = body

        // Validar se a data não é passada
        const eventDate = new Date(dateTimestamp);
        const now = new Date();
        if (eventDate <= now) {
            throw new BadRequestException('Não é possível criar eventos em datas passadas ou na data atual. A data do evento deve ser futura.');
        }

        // Se duration for informado, calcular endTimestamp
        if (duration) {
            const dur = Number(duration);
            if (isNaN(dur) || dur < 1) {
                throw new BadRequestException('A duração do evento deve ser de pelo menos 1 hora.');
            }
            const endDate = new Date(eventDate.getTime() + dur * 60 * 60 * 1000);
            endTimestamp = endDate.toISOString();
        }

        // Garantir formato ISO-8601 válido para o Prisma
        let formattedDateTimestamp = dateTimestamp;
        if (!formattedDateTimestamp.endsWith('Z')) {
            formattedDateTimestamp += 'Z';
        }

        let formattedEndTimestamp = endTimestamp;
        if (endTimestamp && !formattedEndTimestamp.endsWith('Z')) {
            formattedEndTimestamp += 'Z';
        }

        // Validar se endTimestamp é posterior a dateTimestamp
        if (formattedEndTimestamp) {
            const eventEndDate = new Date(formattedEndTimestamp);
            if (eventEndDate <= eventDate) {
                throw new BadRequestException('O horário de término deve ser posterior ao horário de início.');
            }
        }

        // Se for PROFESSIONAL_PROMOTER, o evento deve ser criado inativo
        const isActive = type === 'PROFESSIONAL_OWNER' ? true : false;

        // Se for promoter e não forneceu endereço, buscar do estabelecimento
        let finalAddress = address;
        let finalCoordinates = coordinates_event;

        if (type === 'PROFESSIONAL_PROMOTER' && establishmentId && !address) {
            try {
                // Buscar dados do estabelecimento
                const { establishment } = await this.findEstablishmentById.execute({ id: establishmentId });
                if (establishment) {
                    finalAddress = establishment.address;
                    finalCoordinates = establishment.coord;
                }
            } catch (error) {
                console.error('Erro ao buscar dados do estabelecimento:', error);
            }
        }

        // Verificar se já existe evento no mesmo horário no estabelecimento
        if (establishmentId) {
            try {
                const { events } = await this.findEventsByUserUidOrEstablishmentId.execute({ establishmentId });
                
                // Verificar se há conflito de horário
                const conflictingEvent = events.find(existingEvent => {
                    const existingDate = new Date(existingEvent.dateTimestamp);
                    const newEventDate = new Date(formattedDateTimestamp);
                    
                    // Verificar se é exatamente o mesmo horário
                    return existingDate.getTime() === newEventDate.getTime();
                });
                
                if (conflictingEvent) {
                    const eventDate = new Date(conflictingEvent.dateTimestamp);
                    const formattedDate = eventDate.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                    const formattedTime = eventDate.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    const establishmentName = conflictingEvent.establishment?.name || 'este estabelecimento';
                    
                    throw new BadRequestException(
                        `Já existe um evento agendado em ${establishmentName} para ${formattedDate} às ${formattedTime}. ` +
                        `Não é possível criar eventos simultâneos no mesmo estabelecimento. ` +
                        `Por favor, escolha uma data/hora diferente ou aguarde o evento atual terminar.`
                    );
                }
            } catch (error) {
                // Se o erro já é BadRequestException, re-throw
                if (error instanceof BadRequestException) {
                    throw error;
                }
                // Para outros erros, apenas log e continuar
                console.error('Erro ao verificar conflitos de horário:', error);
            }
        }

        const { event } = await this.createEvent.execute({
            name,
            description,
            dateTimestamp: formattedDateTimestamp, // Adiciona 'Z' para o Prisma aceitar
            endTimestamp: formattedEndTimestamp, // Adiciona 'Z' para o Prisma aceitar
            establishmentId: establishmentId || null,
            address: finalAddress || null,
            coordinates_event: finalCoordinates || null,
            useruid,
            photos,
            isActive,
            tickets // Passar os tickets para o use case
        })

        return { event: EventViewModel.toHTTP(event) }
    }

    @UseGuards(JwtAuthGuard)
    @Get("find-many-by-establishment/:id")
    async findManyByEstablishment(@Param("id") establishmentId: string, @Request() req) {
        const { events } = await this.findEventsByUserUidOrEstablishmentId.execute({ establishmentId })

        return { events };
    }

    @UseGuards(JwtAuthGuard)
    @Get("find-many-by-establishment-approved/:id")
    async findManyByEstablishmentApproved(@Param("id") establishmentId: string, @Request() req) {
        const { events } = await this.findEventsByUserUidOrEstablishmentId.execute({ establishmentId, approvedOnly: true })

        return { events: events.map(EventViewModel.toHTTP) };
    }

    @UseGuards(JwtAuthGuard)
    @Get("find-many-by-user")
    async findManyByUser(@Request() req) {
        const { userId: useruid } = req.user

        const { events } = await this.findEventsByUserUidOrEstablishmentId.execute({ useruid })

        return { events: events.map(EventViewModel.toHTTP) }
    }

    @UseGuards(JwtAuthGuard)
    @Get("find-many-by-user-approved")
    async findManyByUserApproved(@Request() req) {
        const { userId: useruid } = req.user

        const { events } = await this.findEventsByUserUidOrEstablishmentId.execute({ useruid, approvedOnly: true })

        return { events: events.map(EventViewModel.toHTTP) }
    }

    @UseGuards(JwtAuthGuard)
    @Get("find-by-id/:id")
    async findById(@Param("id") id: string, @Request() req) {
        const { event } = await this.findEventById.execute({ id })

        return { event: EventViewModel.toHTTP(event) }
    }

    @UseGuards(JwtAuthGuard, EnsureProfessionalUser)
    @Put("update/:id")
    async update(@Param("id") id: string, @Request() req, @Body() body: any) {
        const { userId: useruid } = req.user

        const { name, description, photos, isActive, establishmentId } = body

        const { event } = await this.updateEvent.execute({
            id,
            name,
            description,
            photos,
            isActive,
            establishmentId
        })

        return { event: EventViewModel.toHTTP(event) }
    }

    @UseGuards(JwtAuthGuard, EnsureProfessionalUser)
    @Post("update-event-takers/:id")
    async updateEventTakers(@Param("id") id: string, @Request() req, @Body() body: any) {
        const { ticketTakers, establishmentId } = body

        await this.updateEventTakersUseCase.execute({
            id,
            ticketTakers,
            establishmentId
        })

        return { message: "Ticket takers atualizados com sucesso" }
    }

    // Endpoints para aprovação de eventos
    @UseGuards(JwtAuthGuard)
    @Get("pending-approvals/:establishmentId")
    async getPendingApprovals(@Param("establishmentId") establishmentId: string, @Request() req) {
        const { type } = req.user;

        // Apenas PROFESSIONAL_OWNER pode ver aprovações pendentes
        if (type !== 'PROFESSIONAL_OWNER') {
            throw new UnauthorizedException('Apenas proprietários de estabelecimentos podem ver aprovações pendentes');
        }

        const { events } = await this.findPendingApprovals.execute({ establishmentId });

        return { events };
    }

    @UseGuards(JwtAuthGuard)
    @Put("approve/:eventId")
    async approveEventEndpoint(@Param("eventId") eventId: string, @Request() req) {
        const { userId: useruid, type } = req.user;

        // Apenas PROFESSIONAL_OWNER pode aprovar eventos
        if (type !== 'PROFESSIONAL_OWNER') {
            throw new UnauthorizedException('Apenas proprietários de estabelecimentos podem aprovar eventos');
        }

        await this.approveEvent.execute({ eventId, useruid });

        return { message: "Evento aprovado com sucesso" };
    }

    @UseGuards(JwtAuthGuard)
    @Put("reject/:eventId")
    async rejectEventEndpoint(@Param("eventId") eventId: string, @Request() req) {
        const { userId: useruid, type } = req.user;

        // Apenas PROFESSIONAL_OWNER pode rejeitar eventos
        if (type !== 'PROFESSIONAL_OWNER') {
            throw new UnauthorizedException('Apenas proprietários de estabelecimentos podem rejeitar eventos');
        }

        await this.rejectEvent.execute({ eventId, useruid });

        return { message: "Evento rejeitado com sucesso" };
    }

    @UseGuards(JwtAuthGuard)
    @Get('reports/stats')
    async getEventStats(@Request() req) {
      const user = req.user;
      let events = [];

      if (user.type === 'PROFESSIONAL_PROMOTER') {
        console.log('Relatório PROMOTER - userId:', user.userId);
        events = await this.prisma.event.findMany({
          where: { useruid: user.userId },
          include: {
            Ticket: {
              include: { TicketSale: true }
            }
          }
        });
        console.log('Eventos encontrados:', events.map(e => ({ id: e.id, useruid: e.useruid, name: e.name })));
      } else if (user.type === 'PROFESSIONAL_OWNER') {
        const establishments = await this.prisma.establishment.findMany({
          where: { userOwnerUid: user.userId },
          select: { id: true }
        });
        const establishmentIds = establishments.map(e => e.id);
        console.log('Relatório OWNER - userId:', user.userId, 'Establishments:', establishmentIds);
        events = await this.prisma.event.findMany({
          where: { establishmentId: { in: establishmentIds } },
          include: {
            Ticket: {
              include: { TicketSale: true }
            }
          }
        });
        console.log('Eventos encontrados:', events.map(e => ({ id: e.id, establishmentId: e.establishmentId, name: e.name })));
      }

      // Montar resposta no formato esperado
      const result = events.map(event => {
        const tickets = event.Ticket || [];
        const ticketsSold = tickets.reduce((sum, t) => sum + (t.TicketSale?.length || 0), 0);
        const ticketsAvailable = tickets.reduce((sum, t) => sum + (t.quantity_available || 0), 0);
        const totalRevenue = tickets.reduce((sum, t) => sum + (t.TicketSale?.reduce((s, sale) => s + (sale.price || 0), 0) || 0), 0);
        return {
          id: event.id,
          name: event.name,
          totalSales: ticketsSold,
          totalRevenue,
          ticketsSold,
          ticketsAvailable,
          date: event.dateTimestamp
        };
      });

      return { events: result };
    }

    @UseGuards(JwtAuthGuard)
    @Get('reports/sales')
    async getEventSales(@Request() req) {
      const user = req.user;
      // Buscar dados reais do banco conforme perfil
      return {
        sales: [] // TODO: implementar busca real
      };
    }

    @UseGuards(JwtAuthGuard)
    @Get('reports/summary')
    async getEventSummary(@Request() req) {
      const user = req.user;
      let events = [];

      if (user.type === 'PROFESSIONAL_PROMOTER') {
        console.log('Resumo PROMOTER - userId:', user.userId);
        events = await this.prisma.event.findMany({
          where: { useruid: user.userId },
          include: {
            Ticket: {
              include: { TicketSale: true }
            }
          }
        });
        console.log('Eventos encontrados:', events.map(e => ({ id: e.id, useruid: e.useruid, name: e.name })));
      } else if (user.type === 'PROFESSIONAL_OWNER') {
        const establishments = await this.prisma.establishment.findMany({
          where: { userOwnerUid: user.userId },
          select: { id: true }
        });
        const establishmentIds = establishments.map(e => e.id);
        console.log('Resumo OWNER - userId:', user.userId, 'Establishments:', establishmentIds);
        events = await this.prisma.event.findMany({
          where: { establishmentId: { in: establishmentIds } },
          include: {
            Ticket: {
              include: { TicketSale: true }
            }
          }
        });
        console.log('Eventos encontrados:', events.map(e => ({ id: e.id, establishmentId: e.establishmentId, name: e.name })));
      }

      let totalRevenue = 0;
      let totalSales = 0;
      let totalEvents = events.length;
      let ticketCount = 0;
      let ticketSum = 0;

      events.forEach(event => {
        const tickets = event.Ticket || [];
        tickets.forEach(t => {
          const sales = t.TicketSale || [];
          totalSales += sales.length;
          totalRevenue += sales.reduce((sum, sale) => sum + (sale.price || 0), 0);
          ticketCount += sales.length;
          ticketSum += sales.reduce((sum, sale) => sum + (sale.price || 0), 0);
        });
      });

      const avgTicketPrice = ticketCount > 0 ? ticketSum / ticketCount : 0;

      return {
        totalRevenue,
        totalSales,
        totalEvents,
        avgTicketPrice
      };
    }
}
