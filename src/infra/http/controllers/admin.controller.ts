import { Controller, Get, Put, Param, Body, UseGuards, Req, UnauthorizedException, Query, Post, Delete, Request, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { FindAllUsers } from "@application/user/use-cases/find-all-users";
import { FindAllEvents } from "@application/event/use-cases/find-all-events";
import { FindAllTickets } from "@application/ticket/use-cases/find-all-tickets";
import { FindAllProfessionals } from "@application/user/use-cases/find-all-professionals";
import { FindAllCustomers } from "@application/user/use-cases/find-all-customers";
import { UserViewModel } from "../view-models/user/user-view-model";
import { EventViewModel } from "../view-models/event/event-view-model";
import { UpdateProfessional } from "@application/user/use-cases/update-professional-user";
import { CreateUser } from "@application/user/use-cases/create-user";
import { DeleteUserById } from "@application/user/use-cases/delete-user-by-id";
import { FindTicketsTakerByOwner } from "@application/ticketTaker/use-cases/find-many-by-owner";
import { CreateTicketTaker } from "@application/ticketTaker/use-cases/create-ticket-taker";
import { DeleteTicketTaker } from "@application/ticketTaker/use-cases/delete-ticket-taker";
import { PrismaService } from "@infra/database/prisma/prisma.service";
import { TicketTaker } from "@application/ticketTaker/entity/TicketTaker";

@ApiTags("Admin")
@Controller('admin')
export class AdminController {
    constructor(
        private findAllUsers: FindAllUsers,
        private findAllEvents: FindAllEvents,
        private findAllTickets: FindAllTickets,
        private findAllProfessionals: FindAllProfessionals,
        private findAllCustomers: FindAllCustomers,
        private updateUserProfessional: UpdateProfessional,
        private createUser: CreateUser,
        private deleteUserById: DeleteUserById,
        private findTicketsTakerByOwner: FindTicketsTakerByOwner,
        private createTicketTakerUseCase: CreateTicketTaker,
        private deleteTicketTakerUseCase: DeleteTicketTaker,
        private prisma: PrismaService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Put('users/:id/status')
    @ApiOperation({ summary: 'Update professional user status' })
    @ApiResponse({ status: 200, description: 'Professional status updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    async updateProfessionalStatus(@Param("id") id: string, @Body() body: { state: boolean }, @Req() req) {
        const { type } = req.user;

        if (type !== "MASTER") {
            throw new UnauthorizedException("Access denied. Only Master users can access this information.");
        }

        try {
            await this.updateUserProfessional.execute({
                data: {
                    isActive: body.state,
                },
                uid: id
            });

            return { message: 'Professional status updated successfully' };
        } catch (error) {
            console.error('Error updating professional status:', error);
            throw new Error('Internal server error');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('stats/overview')
    @ApiOperation({ summary: 'Get system overview statistics' })
    @ApiResponse({ status: 200, description: 'Overview statistics retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    async getOverviewStats(@Req() req) {
        const { type } = req.user;

        if (type !== "MASTER") {
            throw new UnauthorizedException("Access denied. Only Master users can access this information.");
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
                professionalOwner: users.filter(user => user.type === 'PROFESSIONAL_OWNER').length,
                professionalPromoter: users.filter(user => user.type === 'PROFESSIONAL_PROMOTER').length,
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
                totalEvents: events.length,
                totalTickets: tickets.length,
                usersByType,
                ticketsByProfessional,
                activeEvents: events.filter(event => new Date(event.endDate) > new Date()).length,
                completedEvents: events.filter(event => new Date(event.endDate) <= new Date()).length,
            };

        } catch (error) {
            console.error('Error getting overview stats:', error);
            throw new Error('Internal server error');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('users')
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    async getAllUsers(@Req() req) {
        const { type } = req.user;

        if (type !== "MASTER") {
            throw new UnauthorizedException("Access denied. Only Master users can access this information.");
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
            console.error('Error getting users:', error);
            throw new Error('Internal server error');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('users/professionals-detailed')
    @ApiOperation({ summary: 'Get detailed professional users with statistics' })
    @ApiResponse({ status: 200, description: 'Professional users with stats retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    async getProfessionalsDetailed(@Req() req) {
        const { type } = req.user;

        if (type !== "MASTER") {
            throw new UnauthorizedException("Access denied. Only Master users can access this information.");
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
            console.error('Error getting detailed professionals:', error);
            throw new Error('Internal server error');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('events')
    @ApiOperation({ summary: 'Get all events with statistics' })
    @ApiResponse({ status: 200, description: 'Events with stats retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    async getAllEvents(@Req() req) {
        const { type } = req.user;

        if (type !== "MASTER") {
            throw new UnauthorizedException("Access denied. Only Master users can access this information.");
        }

        try {
            // Buscar eventos com tickets e vendas diretamente do Prisma
            const events = await this.prisma.event.findMany({
                include: {
                    establishment: true,
                    user: true,
                    Ticket: {
                        include: {
                            TicketSale: {
                                include: {
                                    payment: true,
                                    user: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            const eventsWithStats = events.map(event => {
                // Calcular estatísticas de vendas
                let totalTicketsSold = 0;
                let totalRevenue = 0;
                let totalAvailable = 0;
                const ticketTypes = [];

                if (event.Ticket) {
                    event.Ticket.forEach(ticket => {
                        const completedSales = ticket.TicketSale.filter(sale => 
                            sale.payment && sale.payment.status === "COMPLETED"
                        );
                        
                        totalTicketsSold += completedSales.length;
                        totalRevenue += completedSales.length * Number(ticket.price);
                        totalAvailable += ticket.quantity_available;

                        ticketTypes.push({
                            id: ticket.id,
                            description: ticket.description,
                            price: Number(ticket.price),
                            quantity_available: ticket.quantity_available,
                            sold_count: completedSales.length,
                            revenue: completedSales.length * Number(ticket.price),
                            sales: ticket.TicketSale.map(sale => ({
                                id: sale.id,
                                payment: {
                                    status: sale.payment?.status || 'PENDING'
                                }
                            }))
                        });
                    });
                }

                return {
                    id: event.id,
                    name: event.name,
                    description: event.description,
                    dateTimestamp: event.dateTimestamp,
                    endTimestamp: event.endTimestamp,
                    photos: event.photos,
                    isActive: event.isActive,
                    createdAt: event.createdAt,
                    updatedAt: event.updatedAt,
                    user: event.user ? {
                        uid: event.user.uid,
                        name: event.user.name,
                        email: event.user.email,
                        type: event.user.type
                    } : null,
                    establishment: event.establishment ? {
                        id: event.establishment.id,
                        name: event.establishment.name,
                        address: event.establishment.address
                    } : null,
                    tickets: ticketTypes,
                    stats: {
                        totalTicketsSold,
                        totalRevenue,
                        totalAvailable,
                        ticketTypesCount: ticketTypes.length
                    }
                };
            });

            return { events: eventsWithStats };

        } catch (error) {
            console.error('Error getting events:', error);
            throw new Error('Internal server error');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('stats/recent-activity')
    @ApiOperation({ summary: 'Get recent system activity' })
    @ApiResponse({ status: 200, description: 'Recent activity retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    async getRecentActivity(@Req() req, @Query('days') days: string = '7') {
        const { type } = req.user;

        if (type !== "MASTER") {
            throw new UnauthorizedException("Access denied. Only Master users can access this information.");
        }

        try {
            const daysNumber = parseInt(days);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysNumber);

            // Buscar dados recentes
            const { users } = await this.findAllUsers.execute();
            const { events } = await this.findAllEvents.execute();
            const { tickets } = await this.findAllTickets.execute();

            const recentUsers = users.filter(user => new Date(user.createdAt) >= cutoffDate);
            const recentEvents = events.filter(event => new Date(event.createdAt) >= cutoffDate);
            const recentTickets = tickets.filter(ticket => new Date(ticket.createdAt) >= cutoffDate);

            return {
                period: `${days} days`,
                newUsers: recentUsers.length,
                newEvents: recentEvents.length,
                newTickets: recentTickets.length,
                usersByType: {
                    personal: recentUsers.filter(user => user.type === 'PERSONAL').length,
                    professionalOwner: recentUsers.filter(user => user.type === 'PROFESSIONAL_OWNER').length,
                    professionalPromoter: recentUsers.filter(user => user.type === 'PROFESSIONAL_PROMOTER').length,
                    ticketTaker: recentUsers.filter(user => user.type === 'TICKETTAKER').length,
                }
            };

        } catch (error) {
            console.error('Error getting recent activity:', error);
            throw new Error('Internal server error');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('tickets')
    @ApiOperation({ summary: 'Get all tickets' })
    @ApiResponse({ status: 200, description: 'Tickets retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    async getAllTickets(@Req() req) {
        const { type } = req.user;

        if (type !== "MASTER") {
            throw new UnauthorizedException("Access denied. Only Master users can access this information.");
        }

        try {
            const { tickets } = await this.findAllTickets.execute();
            
            return {
                tickets: tickets.map(ticket => ({
                    id: ticket.id,
                    description: ticket.description,
                    price: ticket.price,
                    eventId: ticket.eventId,
                    quantity_available: ticket.quantity_available,
                    createdAt: ticket.createdAt,
                    updatedAt: ticket.updatedAt,
                    // Incluir informações do evento se disponível
                    event: ticket.event ? {
                        id: ticket.event.id,
                        name: ticket.event.name,
                        startDate: ticket.event.startDate,
                        endDate: ticket.event.endDate
                    } : null
                }))
            };

        } catch (error) {
            console.error('Error getting tickets:', error);
            throw new Error('Internal server error');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('config')
    @ApiOperation({ summary: 'Get system configuration' })
    @ApiResponse({ status: 200, description: 'System configuration retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    async getSystemConfig(@Req() req) {
        const { type } = req.user;
        if (type !== "MASTER") {
            throw new UnauthorizedException("Access denied. Only Master users can access this information.");
        }
        // Configuração mockada
        return {
            systemName: "Lets Go",
            systemDescription: "Sistema de venda de ingressos para eventos",
            maintenanceMode: false,
            allowNewRegistrations: true,
            requireEmailVerification: true,
            maxFileSize: 5242880, // 5MB
            allowedFileTypes: ["jpg", "jpeg", "png", "gif"],
            emailSettings: {
                smtpHost: "",
                smtpPort: 587,
                smtpUser: "",
                smtpPassword: ""
            },
            paymentSettings: {
                stripeEnabled: false,
                stripePublicKey: "",
                stripeSecretKey: "",
                pixEnabled: true
            },
            notificationSettings: {
                emailNotifications: true,
                pushNotifications: true,
                smsNotifications: false
            }
        };
    }

    // Endpoints para gerenciar usuários TICKETTAKER
    // 
    // TICKETTAKER tem função única e específica:
    // - Ler QR Code do ticket
    // - Validar se o ticket é válido  
    // - Confirmar entrada no evento
    //
    // NÃO deve ter relacionamentos com:
    // - Pagamentos (Payment)
    // - Vendas (TicketSale)
    // - Eventos (Event)
    // - Estabelecimentos (Establishment)
    // - Logs de auditoria (EventAudit, TicketAudit, etc.)
    @UseGuards(JwtAuthGuard)
    @Get('users/ticket-takers')
    @ApiOperation({ summary: 'Get ticket takers' })
    @ApiResponse({ status: 200, description: 'Ticket takers retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    async getTicketTakers(@Req() req) {
        const { type, userId } = req.user;

        // Permitir acesso para MASTER e usuários profissionais
        if (type !== "MASTER" && type !== "PROFESSIONAL_OWNER" && type !== "PROFESSIONAL_PROMOTER") {
            throw new UnauthorizedException("Access denied.");
        }

        try {
            let ticketTakers = [];

            if (type === "MASTER") {
                // MASTER pode ver todos os ticket takers
                const { users } = await this.findAllUsers.execute();
                const ticketTakerUsers = users.filter(user => user.type === 'TICKETTAKER');
                
                // Buscar informações dos ticket takers
                const ticketTakerData = await Promise.all(
                    ticketTakerUsers.map(async (user) => {
                        const ticketTaker = await this.prisma.ticketTaker.findFirst({
                            where: { userTicketTakerUid: user.uid }
                        });
                        
                        return {
                            uid: user.uid,
                            name: user.name,
                            email: user.email,
                            phone: user.phone,
                            createdAt: user.createdAt,
                            isActive: user.isActive,
                            ownerUid: ticketTaker?.userOwnerUid || null,
                            ownerName: ticketTaker?.userOwnerUid ? await this.getOwnerName(ticketTaker.userOwnerUid) : null
                        };
                    })
                );
                
                ticketTakers = ticketTakerData;
            } else {
                // Usuários profissionais veem apenas seus próprios ticket takers
                const { users } = await this.findTicketsTakerByOwner.execute({ userOwnerUid: userId });
                
                // Buscar informações dos ticket takers
                const ticketTakerData = await Promise.all(
                    users.map(async (user) => {
                        const ticketTaker = await this.prisma.ticketTaker.findFirst({
                            where: { 
                                userTicketTakerUid: user.uid,
                                userOwnerUid: userId
                            }
                        });
                        
                        return {
                            uid: user.uid,
                            name: user.name,
                            email: user.email,
                            phone: user.phone,
                            createdAt: user.createdAt,
                            isActive: user.isActive,
                            ownerUid: ticketTaker?.userOwnerUid || userId
                        };
                    })
                );
                
                ticketTakers = ticketTakerData;
            }

            return { ticketTakers };

        } catch (error) {
            console.error('Error getting ticket takers:', error);
            throw new Error('Internal server error');
        }
    }

    // Helper method para buscar nome do owner
    private async getOwnerName(ownerUid: string): Promise<string | null> {
        try {
            const owner = await this.prisma.user.findUnique({
                where: { uid: ownerUid },
                select: { name: true }
            });
            return owner?.name || null;
        } catch (error) {
            console.error('Error getting owner name:', error);
            return null;
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('users/ticket-takers')
    @ApiOperation({ summary: 'Create ticket taker' })
    @ApiResponse({ status: 201, description: 'Ticket taker created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    async createTicketTaker(@Req() req, @Body() body: any) {
        const { type, userId } = req.user;

        // Permitir acesso para MASTER e usuários profissionais
        if (type !== "MASTER" && type !== "PROFESSIONAL_OWNER" && type !== "PROFESSIONAL_PROMOTER") {
            throw new UnauthorizedException("Access denied.");
        }

        try {
            const { email, name, password, phone, birthDate } = body;

            // Criar usuário
            const { user } = await this.createUser.execute({
                email,
                name,
                password,
                phone,
                birthDate,
                type: 'TICKETTAKER',
                isOwnerOfEstablishment: false,
                address: null,
                avatar: null,
                document: null
            });

            // Criar ticket taker manualmente
            const ticketTaker = await this.prisma.ticketTaker.create({
                data: {
                    userOwnerUid: userId,
                    userTicketTakerUid: user.id
                }
            });

            return {
                message: 'Recepcionista criado com sucesso!',
                user: UserViewModel.toHTTP(user)
            };

        } catch (error) {
            console.error('Error creating ticket taker:', error);
            // Se for erro de email já cadastrado, retorne 400 com mensagem amigável
            if (error.code === 'P2002' || error.message?.includes('email') || error.message?.includes('cadastrado')) {
                throw new BadRequestException('Endereço de email já cadastrado.');
            }
            throw new InternalServerErrorException('Erro interno ao criar recepcionista.');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Delete('users/ticket-takers/:id')
    @ApiOperation({ summary: 'Delete ticket taker' })
    @ApiResponse({ status: 200, description: 'Ticket taker deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    @ApiResponse({ status: 404, description: 'Ticket taker not found' })
    async deleteTicketTaker(@Param("id") id: string, @Req() req) {
        const { type, userId } = req.user;

        // Permitir acesso para MASTER e usuários profissionais
        if (type !== "MASTER" && type !== "PROFESSIONAL_OWNER" && type !== "PROFESSIONAL_PROMOTER") {
            throw new UnauthorizedException("Access denied.");
        }

        try {
            // Buscar o ticket taker
            const ticketTaker = await this.prisma.ticketTaker.findUnique({
                where: { id }
            });

            if (!ticketTaker) {
                throw new BadRequestException('Ticket taker not found');
            }

            // Verificar permissões
            if (type !== "MASTER" && ticketTaker.userOwnerUid !== userId) {
                throw new UnauthorizedException("You can only delete your own ticket takers");
            }

            // Buscar todos os eventos onde este TICKETTAKER está associado (pela tabela eventsReceptionist)
            const eventsWithTicketTaker = await this.prisma.eventsReceptionist.findMany({
                where: {
                    useruid: ticketTaker.userTicketTakerUid
                },
                include: {
                    event: true
                }
            });

            // Remover todas as associações na tabela eventsReceptionist para esse TicketTaker
            const allEventManagers = await this.prisma.eventsReceptionist.findMany({
                where: { useruid: ticketTaker.userTicketTakerUid }
            });

            const deleteResult = await this.prisma.eventsReceptionist.deleteMany({
                where: { useruid: ticketTaker.userTicketTakerUid }
            });

            // Verificar se ainda há vínculos após a deleção
            const allEventManagersAfter = await this.prisma.eventsReceptionist.findMany({
                where: { useruid: ticketTaker.userTicketTakerUid }
            });

            // Deletar apenas a associação, não o usuário
            await this.prisma.ticketTaker.delete({
                where: { id: ticketTaker.id }
            });

            // Deletar o usuário também
            await this.deleteUserById.execute({ id: ticketTaker.userTicketTakerUid });

            return { message: 'Ticket taker deleted successfully' };

        } catch (error) {
            console.error('Error deleting ticket taker:', error);
            throw new Error('Internal server error');
        }
    }

    // Endpoint para validação de tickets (função principal do TICKETTAKER)
    @UseGuards(JwtAuthGuard)
    @Post('tickets/validate')
    @ApiOperation({ summary: 'Validate ticket (main TICKETTAKER function)' })
    @ApiResponse({ status: 200, description: 'Ticket validation result' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    async validateTicket(@Req() req, @Body() body: { ticketId: string; qrCode: string }) {
        const { type } = req.user;

        // Apenas TICKETTAKER pode validar tickets
        if (type !== "TICKETTAKER") {
            throw new UnauthorizedException("Only ticket takers can validate tickets.");
        }

        try {
            // TODO: Implementar lógica de validação de ticket
            // 1. Verificar se o QR Code é válido
            // 2. Verificar se o ticket não foi usado
            // 3. Verificar se o evento está ativo
            // 4. Marcar ticket como usado
            // 5. Retornar confirmação

            return {
                message: 'Ticket valid!',
                ticketId: body.ticketId,
                validated: true,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error validating ticket:', error);
            throw new Error('Internal server error');
        }
    }

    // Endpoint para exportar relatórios
    @UseGuards(JwtAuthGuard)
    @Get('reports/export/:type')
    @ApiOperation({ summary: 'Export reports' })
    @ApiResponse({ status: 200, description: 'Report exported successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    async exportReport(@Req() req, @Param('type') type: string, @Query() query: any) {
        const { type: userType } = req.user;

        if (userType !== "MASTER") {
            throw new UnauthorizedException("Access denied. Only Master users can access this information.");
        }

        try {
            // Buscar dados baseados no tipo de relatório
            let reportData = {};

            switch (type) {
                case 'general':
                    // Relatório geral com estatísticas
                    const { users } = await this.findAllUsers.execute();
                    const { events } = await this.findAllEvents.execute();
                    const { tickets } = await this.findAllTickets.execute();

                    reportData = {
                        totalUsers: users.length,
                        totalEvents: events.length,
                        totalTickets: tickets.length,
                        usersByType: {
                            personal: users.filter(user => user.type === 'PERSONAL').length,
                            professionalOwner: users.filter(user => user.type === 'PROFESSIONAL_OWNER').length,
                            professionalPromoter: users.filter(user => user.type === 'PROFESSIONAL_PROMOTER').length,
                            ticketTaker: users.filter(user => user.type === 'TICKETTAKER').length,
                            master: users.filter(user => user.type === 'MASTER').length,
                        },
                        activeEvents: events.filter(event => new Date(event.endDate) > new Date()).length,
                        completedEvents: events.filter(event => new Date(event.endDate) <= new Date()).length,
                    };
                    break;

                case 'events':
                    // Relatório de eventos
                    const eventsWithStats = await this.prisma.event.findMany({
                        include: {
                            establishment: true,
                            user: true,
                            Ticket: {
                                include: {
                                    TicketSale: {
                                        include: {
                                            payment: true
                                        }
                                    }
                                }
                            }
                        },
                        orderBy: {
                            createdAt: 'desc'
                        }
                    });

                    reportData = {
                        events: eventsWithStats.map(event => {
                            let totalRevenue = 0;
                            let totalSales = 0;

                            if (event.Ticket) {
                                event.Ticket.forEach(ticket => {
                                    const completedSales = ticket.TicketSale.filter(sale => 
                                        sale.payment && sale.payment.status === "COMPLETED"
                                    );
                                    totalSales += completedSales.length;
                                    totalRevenue += completedSales.length * Number(ticket.price);
                                });
                            }

                            return {
                                id: event.id,
                                name: event.name,
                                establishment: event.establishment?.name || 'N/A',
                                date: event.dateTimestamp,
                                totalSales,
                                totalRevenue,
                                status: event.isActive ? 'Ativo' : 'Inativo'
                            };
                        })
                    };
                    break;

                case 'users':
                    // Relatório de usuários
                    const allUsers = await this.prisma.user.findMany({
                        include: {
                            Establishment: true
                        },
                        orderBy: {
                            createdAt: 'desc'
                        }
                    });

                    reportData = {
                        users: allUsers.map(user => ({
                            id: user.uid,
                            name: user.name,
                            email: user.email,
                            type: user.type,
                            isActive: user.isActive,
                            createdAt: user.createdAt,
                            establishment: user.Establishment?.[0]?.name || 'N/A'
                        }))
                    };
                    break;

                default:
                    throw new BadRequestException('Tipo de relatório inválido');
            }

            return reportData;

        } catch (error) {
            console.error('Error exporting report:', error);
            throw new Error('Internal server error');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('users/check-unlink/:uid')
    @ApiOperation({ summary: 'Check consequences of unlinking ticket taker' })
    @ApiResponse({ status: 200, description: 'Check completed' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Ticket taker not found' })
    async checkUnlinkTicketTaker(@Param("uid") uid: string, @Req() req) {
        const { type, userId } = req.user;

        // Permitir acesso para MASTER e usuários profissionais
        if (type !== "MASTER" && type !== "PROFESSIONAL_OWNER" && type !== "PROFESSIONAL_PROMOTER") {
            throw new UnauthorizedException("Access denied.");
        }

        try {
            // Buscar o ticket taker pelo UID do usuário
            const ticketTaker = await this.prisma.ticketTaker.findFirst({
                where: { 
                    userTicketTakerUid: uid,
                    userOwnerUid: userId
                }
            });

            if (!ticketTaker) {
                throw new BadRequestException('Recepcionista não encontrado');
            }

            // Buscar todos os eventos onde este TICKETTAKER está associado
            const eventsWithTicketTaker = await this.prisma.eventsReceptionist.findMany({
                where: {
                    useruid: uid
                },
                include: {
                    event: true
                }
            });

            const totalEventsAffected = eventsWithTicketTaker.length;
            const eventsAffected = eventsWithTicketTaker.map(e => ({
                id: e.event.id,
                name: e.event.name,
                dateTimestamp: e.event.dateTimestamp
            }));

            let warning = null;
            if (totalEventsAffected > 0) {
                warning = `Este recepcionista está vinculado a ${totalEventsAffected} evento(s). Ao desvincular, ele não poderá mais validar ingressos nesses eventos.`;
            }

            return {
                eventsAffected,
                totalEventsAffected,
                warning
            };

        } catch (error) {
            console.error('Error checking unlink consequences:', error);
            throw new Error('Internal server error');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Delete('users/unlink/:uid')
    @ApiOperation({ summary: 'Unlink ticket taker' })
    @ApiResponse({ status: 200, description: 'Ticket taker unlinked successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Ticket taker not found' })
    async unlinkTicketTaker(@Param("uid") uid: string, @Req() req) {
        const { type, userId } = req.user;

        // Permitir acesso para MASTER e usuários profissionais
        if (type !== "MASTER" && type !== "PROFESSIONAL_OWNER" && type !== "PROFESSIONAL_PROMOTER") {
            throw new UnauthorizedException("Access denied.");
        }

        try {
            // Buscar o ticket taker pelo UID do usuário
            const ticketTaker = await this.prisma.ticketTaker.findFirst({
                where: { 
                    userTicketTakerUid: uid,
                    userOwnerUid: userId
                }
            });

            if (!ticketTaker) {
                throw new BadRequestException('Recepcionista não encontrado');
            }

            // Remover todas as associações na tabela eventsReceptionist para esse TicketTaker
            const deleteResult = await this.prisma.eventsReceptionist.deleteMany({
                where: { useruid: uid }
            });

            // Deletar apenas a associação, não o usuário
            await this.prisma.ticketTaker.delete({
                where: { id: ticketTaker.id }
            });

            return { 
                message: 'Recepcionista desvinculado com sucesso!',
                eventsUpdated: deleteResult.count
            };

        } catch (error) {
            console.error('Error unlinking ticket taker:', error);
            throw new Error('Internal server error');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('users/search-ticket-takers')
    @ApiOperation({ summary: 'Search existing ticket takers' })
    @ApiResponse({ status: 200, description: 'Search completed' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async searchTicketTakers(@Query('q') query: string, @Req() req) {
        const { type, userId } = req.user;

        // Permitir acesso para MASTER e usuários profissionais
        if (type !== "MASTER" && type !== "PROFESSIONAL_OWNER" && type !== "PROFESSIONAL_PROMOTER") {
            throw new UnauthorizedException("Access denied.");
        }

        try {
            // Buscar usuários do tipo TICKETTAKER que não estão vinculados ao usuário atual
            const ticketTakers = await this.prisma.user.findMany({
                where: {
                    type: 'TICKETTAKER',
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { email: { contains: query, mode: 'insensitive' } }
                    ],
                    // Excluir os que já estão vinculados ao usuário atual
                    NOT: {
                        TicketTaker: {
                            some: {
                                userOwnerUid: userId
                            }
                        }
                    }
                },
                select: {
                    uid: true,
                    name: true,
                    email: true,
                    isActive: true,
                    createdAt: true
                }
            });

            return { ticketTakers };

        } catch (error) {
            console.error('Error searching ticket takers:', error);
            throw new Error('Internal server error');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('users/link-ticket-taker')
    @ApiOperation({ summary: 'Link existing ticket taker' })
    @ApiResponse({ status: 200, description: 'Ticket taker linked successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Ticket taker not found' })
    async linkTicketTaker(@Body() body: { ticketTakerId: string }, @Req() req) {
        const { type, userId } = req.user;

        // Permitir acesso para MASTER e usuários profissionais
        if (type !== "MASTER" && type !== "PROFESSIONAL_OWNER" && type !== "PROFESSIONAL_PROMOTER") {
            throw new UnauthorizedException("Access denied.");
        }

        try {
            const { ticketTakerId } = body;

            // Verificar se o usuário existe e é do tipo TICKETTAKER
            const user = await this.prisma.user.findUnique({
                where: { uid: ticketTakerId }
            });

            if (!user || user.type !== 'TICKETTAKER') {
                throw new BadRequestException('Recepcionista não encontrado');
            }

            // Verificar se já está vinculado
            const existingLink = await this.prisma.ticketTaker.findFirst({
                where: {
                    userTicketTakerUid: ticketTakerId,
                    userOwnerUid: userId
                }
            });

            if (existingLink) {
                throw new BadRequestException('Este recepcionista já está vinculado à sua conta');
            }

            // Criar o vínculo
            await this.prisma.ticketTaker.create({
                data: {
                    userOwnerUid: userId,
                    userTicketTakerUid: ticketTakerId
                }
            });

            return { 
                message: 'Recepcionista vinculado com sucesso!'
            };

        } catch (error) {
            console.error('Error linking ticket taker:', error);
            throw new Error('Internal server error');
        }
    }
}
