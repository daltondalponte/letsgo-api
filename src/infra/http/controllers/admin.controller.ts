import { Controller, Get, UseGuards, Req, UnauthorizedException } from "@nestjs/common";
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { FindAllUsers } from "@application/user/use-cases/find-all-users";
import { FindAllEvents } from "@application/event/use-cases/find-all-events";
import { FindAllTickets } from "@application/ticket/use-cases/find-all-tickets";
import { FindAllProfessionals } from "@application/user/use-cases/find-all-professionals";
import { FindAllCustomers } from "@application/user/use-cases/find-all-customers";
import { UserViewModel } from "../view-models/user/user-view-model";
import { EventViewModel } from "../view-models/event/event-view-model";

@ApiTags("Admin Master")
@Controller('admin')
export class AdminController {
    constructor(
        private findAllUsers: FindAllUsers,
        private findAllEvents: FindAllEvents,
        private findAllTickets: FindAllTickets,
        private findAllProfessionals: FindAllProfessionals,
        private findAllCustomers: FindAllCustomers,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get('stats/overview')
    async getOverviewStats(@Req() req) {
        const { type } = req.user;

        if (type !== "MASTER") {
            throw new UnauthorizedException("Acesso negado. Apenas usuários Master podem acessar estas informações.");
        }

        try {
            // Buscar todos os usuários
            const { users } = await this.findAllUsers.execute();
            
            // Buscar todos os eventos
            const { events } = await this.findAllEvents.execute();
            
            // Buscar todos os tickets vendidos
            const { tickets } = await this.findAllTickets.execute();

            // Contar usuários por tipo
            const usersByType = {
                personal: users.filter(user => user.type === 'PERSONAL').length,
                professional: users.filter(user => user.type === 'PROFESSIONAL').length,
                ticketTaker: users.filter(user => user.type === 'TICKETTAKER').length,
                master: users.filter(user => user.type === 'MASTER').length,
            };

            // Calcular estatísticas de tickets por usuário jurídico
            const ticketsByProfessional = {};
            
            for (const ticket of tickets) {
                const event = events.find(e => e.id === ticket.eventId);
                if (event && event.userOwnerId) {
                    if (!ticketsByProfessional[event.userOwnerId]) {
                        ticketsByProfessional[event.userOwnerId] = 0;
                    }
                    ticketsByProfessional[event.userOwnerId]++;
                }
            }

            return {
                totalUsers: users.length,
                usersByType,
                totalEvents: events.length,
                totalTicketsSold: tickets.length,
                ticketsByProfessional,
                activeUsers: users.filter(user => user.isActive).length,
                inactiveUsers: users.filter(user => !user.isActive).length,
            };

        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            throw new Error('Erro interno do servidor');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('users/all')
    async getAllUsers(@Req() req) {
        const { type } = req.user;

        if (type !== "MASTER") {
            throw new UnauthorizedException("Acesso negado. Apenas usuários Master podem acessar estas informações.");
        }

        try {
            const { users } = await this.findAllUsers.execute();
            
            return {
                users: users.map(user => ({
                    ...UserViewModel.toHTTP(user),
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                }))
            };

        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            throw new Error('Erro interno do servidor');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('users/professionals-detailed')
    async getProfessionalsDetailed(@Req() req) {
        const { type } = req.user;

        if (type !== "MASTER") {
            throw new UnauthorizedException("Acesso negado. Apenas usuários Master podem acessar estas informações.");
        }

        try {
            const { userData } = await this.findAllProfessionals.execute();
            
            // Buscar eventos e tickets para cada profissional
            const { events } = await this.findAllEvents.execute();
            const { tickets } = await this.findAllTickets.execute();

            const professionalsWithStats = userData.map(data => {
                const userEvents = events.filter(event => event.userOwnerId === data.user.id);
                const userTickets = tickets.filter(ticket => 
                    userEvents.some(event => event.id === ticket.eventId)
                );

                return {
                    user: UserViewModel.toHTTP(data.user),
                    establishment: data.establishment ? {
                        id: data.establishment.id,
                        name: data.establishment.name,
                        address: data.establishment.address,
                        coordinates: data.establishment.coord, // Corrigido para usar coord em vez de coordinates
                    } : null,
                    stats: {
                        totalEvents: userEvents.length,
                        totalTicketsSold: userTickets.length,
                        activeEvents: userEvents.filter(event => new Date(event.endDate) > new Date()).length,
                    }
                };
            });

            return { professionals: professionalsWithStats };

        } catch (error) {
            console.error('Erro ao buscar profissionais detalhados:', error);
            throw new Error('Erro interno do servidor');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('events/all')
    async getAllEvents(@Req() req) {
        const { type } = req.user;

        if (type !== "MASTER") {
            throw new UnauthorizedException("Acesso negado. Apenas usuários Master podem acessar estas informações.");
        }

        try {
            const { events } = await this.findAllEvents.execute();
            const { tickets } = await this.findAllTickets.execute();

            const eventsWithStats = events.map(event => {
                const eventTickets = tickets.filter(ticket => ticket.eventId === event.id);
                
                return {
                    ...EventViewModel.toHTTP(event),
                    stats: {
                        totalTicketsSold: eventTickets.length,
                        revenue: eventTickets.reduce((sum, ticket) => sum + (ticket.price || 0), 0),
                    }
                };
            });

            return { events: eventsWithStats };

        } catch (error) {
            console.error('Erro ao buscar eventos:', error);
            throw new Error('Erro interno do servidor');
        }
    }
}
