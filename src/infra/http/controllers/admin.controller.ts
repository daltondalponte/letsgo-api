import { Controller, Get, Put, Param, Body, UseGuards, Req, UnauthorizedException, Query, Post, Delete, Request, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { ApiTags } from '@nestjs/swagger';
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


@ApiTags("Admin Master")
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
        private deleteTicketTaker: DeleteTicketTaker,
        private prisma: PrismaService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Put('users/professionals/:id/status')
    async updateProfessionalStatus(@Param("id") id: string, @Body() body: { state: boolean }, @Req() req) {
        const { type } = req.user;

        if (type !== "MASTER") {
            throw new UnauthorizedException("Acesso negado. Apenas usuários Master podem acessar estas informações.");
        }

        try {
            await this.updateUserProfessional.execute({
                data: {
                    isActive: body.state,
                },
                uid: id
            });

            return { message: 'Status atualizado com sucesso' };
        } catch (error) {
            console.error('Erro ao atualizar status do profissional:', error);
            throw new Error('Erro interno do servidor');
        }
    }

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
                    ...event.props,
                    id: event.id,
                    user: event.user ? require('../view-models/user/user-view-model').UserViewModel.toHTTP(event.user) : null,
                    establishment: event.establishment ? require('../view-models/establishment/establishment-view-model').EstablishmentViewModel.toHTTP(event.establishment) : null,
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

    @UseGuards(JwtAuthGuard)
    @Get('stats/recent-activity')
    async getRecentActivity(@Req() req, @Query('days') days: string = '7') {
        const { type } = req.user;

        if (type !== "MASTER") {
            throw new UnauthorizedException("Acesso negado. Apenas usuários Master podem acessar estas informações.");
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
                period: `${days} dias`,
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
            console.error('Erro ao buscar atividade recente:', error);
            throw new Error('Erro interno do servidor');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('stats/top-performers')
    async getTopPerformers(@Req() req) {
        const { type } = req.user;

        if (type !== "MASTER") {
            throw new UnauthorizedException("Acesso negado. Apenas usuários Master podem acessar estas informações.");
        }

        try {
            const { events } = await this.findAllEvents.execute();
            const { tickets } = await this.findAllTickets.execute();
            const { userData } = await this.findAllProfessionals.execute();

            // Calcular performance por profissional
            const performers = userData.map(data => {
                const userEvents = events.filter(event => event.userOwnerId === data.user.id);
                const userTickets = tickets.filter(ticket => 
                    userEvents.some(event => event.id === ticket.eventId)
                );

                const totalRevenue = userTickets.reduce((sum, ticket) => sum + (ticket.price || 0), 0);

                return {
                    user: {
                        id: data.user.id,
                        name: data.user.name,
                        email: data.user.email,
                        type: data.user.type
                    },
                    establishment: data.establishment ? {
                        id: data.establishment.id,
                        name: data.establishment.name
                    } : null,
                    stats: {
                        totalEvents: userEvents.length,
                        totalTicketsSold: userTickets.length,
                        totalRevenue: totalRevenue,
                        averageRevenuePerEvent: userEvents.length > 0 ? totalRevenue / userEvents.length : 0
                    }
                };
            });

            // Ordenar por receita total
            performers.sort((a, b) => b.stats.totalRevenue - a.stats.totalRevenue);

            return {
                topPerformers: performers.slice(0, 10) // Top 10
            };

        } catch (error) {
            console.error('Erro ao buscar top performers:', error);
            throw new Error('Erro interno do servidor');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('tickets/all')
    async getAllTickets(@Req() req) {
        const { type } = req.user;

        if (type !== "MASTER") {
            throw new UnauthorizedException("Acesso negado. Apenas usuários Master podem acessar estas informações.");
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
            console.error('Erro ao buscar tickets:', error);
            throw new Error('Erro interno do servidor');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('config')
    async getSystemConfig(@Req() req) {
        const { type } = req.user;
        if (type !== "MASTER") {
            throw new UnauthorizedException("Acesso negado. Apenas usuários Master podem acessar estas informações.");
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

    @UseGuards(JwtAuthGuard)
    @Put('config')
    async updateSystemConfig(@Req() req, @Body() body: any) {
        const { type } = req.user;
        if (type !== "MASTER") {
            throw new UnauthorizedException("Acesso negado. Apenas usuários Master podem acessar estas informações.");
        }
        // Apenas retorna sucesso (mock)
        return { message: 'Configurações salvas com sucesso!' };
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
    async getTicketTakers(@Req() req) {
        const { type, userId } = req.user;

        // Permitir acesso para MASTER e usuários profissionais
        if (type !== "MASTER" && type !== "PROFESSIONAL_OWNER" && type !== "PROFESSIONAL_PROMOTER") {
            throw new UnauthorizedException("Acesso negado.");
        }

        try {
            // Se for MASTER, mostrar todos os TICKETTAKER
            if (type === "MASTER") {
                const { users } = await this.findAllUsers.execute();
                const ticketTakers = users.filter(user => user.type === 'TICKETTAKER');
                
                return {
                    ticketTakers: ticketTakers.map(user => ({
                        uid: user.id,
                        name: user.name,
                        email: user.email,
                        type: user.type,
                        isActive: user.isActive,
                        createdAt: user.createdAt
                    }))
                };
            } else {
                // Para usuários profissionais, mostrar apenas os TICKETTAKER criados por eles
                const { users } = await this.findTicketsTakerByOwner.execute({ userOwnerUid: userId });
                
                return {
                    ticketTakers: users.map(user => ({
                        uid: user.id,
                        name: user.name,
                        email: user.email,
                        type: user.type,
                        isActive: user.isActive,
                        createdAt: user.createdAt
                    }))
                };
            }

        } catch (error) {
            console.error('Erro ao buscar ticket takers:', error);
            throw new Error('Erro interno do servidor');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('users/create-ticket-taker')
    async createTicketTaker(@Req() req, @Body() body: { name: string; email: string; password: string }) {
        const { type, userId } = req.user;

        // Permitir acesso para MASTER e usuários profissionais
        if (type !== "MASTER" && type !== "PROFESSIONAL_OWNER" && type !== "PROFESSIONAL_PROMOTER") {
            throw new UnauthorizedException("Acesso negado.");
        }

        // Validações dos campos obrigatórios
        if (!body.name || !body.name.trim()) {
            throw new BadRequestException('Nome é obrigatório.');
        }

        if (!body.email || !body.email.trim()) {
            throw new BadRequestException('Email é obrigatório.');
        }

        if (!body.password || !body.password.trim()) {
            throw new BadRequestException('Senha é obrigatória.');
        }

        // Validar formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email.trim())) {
            throw new BadRequestException('Formato de email inválido.');
        }

        // Validar tamanho mínimo da senha
        if (body.password.trim().length < 6) {
            throw new BadRequestException('Senha deve ter pelo menos 6 caracteres.');
        }

        try {
            // Verificar se já existe um TICKETTAKER com este email
            const existingUser = await this.prisma.user.findUnique({
                where: { email: body.email }
            });

            if (existingUser) {
                // Se o usuário existe mas não é TICKETTAKER, retornar erro
                if (existingUser.type !== 'TICKETTAKER') {
                    throw new Error('Este email já está sendo usado por outro tipo de usuário.');
                }

                // Se já é TICKETTAKER, verificar se já está vinculado ao usuário atual
                const existingTicketTaker = await this.prisma.ticketTaker.findFirst({
                    where: {
                        userOwnerUid: userId,
                        userTicketTakerUid: existingUser.uid
                    }
                });

                if (existingTicketTaker) {
                    throw new Error('Este administrador já está vinculado ao seu perfil.');
                }

                throw new Error('Este administrador já existe no sistema. Use o botão "Buscar Existentes" para vincular um administrador já cadastrado.');
            }

            // Se não existe, criar novo TICKETTAKER
            const { user } = await this.createTicketTakerUseCase.execute({
                userOwnerUid: userId,
                name: body.name,
                email: body.email
            });
            return {
                message: 'Administrador criado com sucesso!',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    type: user.type
                }
            };

        } catch (error) {
            console.error('Erro ao criar/vincular ticket taker:', error);
            
            // Se for BadRequestException do CreateUser (email já existe)
            if (error instanceof BadRequestException) {
                throw error;
            }
            
            if (error.message.includes('Este email já está sendo usado por outro tipo de usuário')) {
                throw new BadRequestException('Este email já está sendo usado por outro tipo de usuário.');
            }
            
            if (error.message.includes('Este administrador já está vinculado ao seu perfil')) {
                throw new BadRequestException('Este administrador já está vinculado ao seu perfil.');
            }
            
            if (error.message.includes('Este administrador já existe no sistema')) {
                throw new BadRequestException('Este administrador já existe no sistema. Use o botão "Buscar Existentes" para vincular um administrador já cadastrado.');
            }
            
            throw new InternalServerErrorException('Erro interno do servidor');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('users/check-unlink/:id')
    async checkUnlinkTicketTaker(@Param("id") id: string, @Req() req) {
        const { type, userId, uid } = req.user;
        const userOwnerUid = userId || uid;

        // Permitir acesso para MASTER e usuários profissionais
        if (type !== "MASTER" && type !== "PROFESSIONAL_OWNER" && type !== "PROFESSIONAL_PROMOTER") {
            throw new UnauthorizedException("Acesso negado.");
        }

        try {
            // Se não for MASTER, verificar se o TICKETTAKER pertence ao usuário
            if (type !== "MASTER") {
                try {
                    const { users } = await this.findTicketsTakerByOwner.execute({ userOwnerUid });
                    const userExists = users.find(u => u.id === id || u.uid === id);
                    
                    if (!userExists) {
                        throw new UnauthorizedException("Não permitido verificar este administrador.");
                    }
                } catch (error) {
                    console.error('Erro ao verificar permissão:', error);
                    throw new UnauthorizedException("Erro ao verificar permissões.");
                }
            }

            // Buscar o usuário TICKETTAKER para obter o email
            const ticketTakerUser = await this.prisma.user.findUnique({
                where: { uid: id }
            });

            if (!ticketTakerUser) {
                throw new Error('Usuário TICKETTAKER não encontrado.');
            }

            // Buscar todos os eventos onde este TICKETTAKER está associado
            const eventsWithTicketTaker = await this.prisma.event.findMany({
                where: {
                    ticketTakers: {
                        has: ticketTakerUser.email
                    }
                },
                select: {
                    id: true,
                    name: true,
                    dateTimestamp: true
                }
            });

            return {
                ticketTaker: {
                    id: ticketTakerUser.uid,
                    name: ticketTakerUser.name,
                    email: ticketTakerUser.email
                },
                eventsAffected: eventsWithTicketTaker,
                totalEventsAffected: eventsWithTicketTaker.length,
                warning: eventsWithTicketTaker.length > 0 
                    ? `Este administrador está associado a ${eventsWithTicketTaker.length} evento(s). Ao desvinculá-lo, ele será removido de todos os eventos automaticamente.`
                    : "Este administrador não está associado a nenhum evento."
            };

        } catch (error) {
            console.error('Erro ao verificar ticket taker:', error);
            
            if (error.message.includes('Usuário TICKETTAKER não encontrado')) {
                throw new BadRequestException('Usuário TICKETTAKER não encontrado no sistema.');
            }
            
            throw new InternalServerErrorException('Erro interno do servidor');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Delete('users/unlink/:id')
    async unlinkTicketTaker(@Param("id") id: string, @Req() req) {
        const { type, userId, uid } = req.user;
        const userOwnerUid = userId || uid;

        // Permitir acesso para MASTER e usuários profissionais
        if (type !== "MASTER" && type !== "PROFESSIONAL_OWNER" && type !== "PROFESSIONAL_PROMOTER") {
            throw new UnauthorizedException("Acesso negado.");
        }

        try {
            // Se não for MASTER, verificar se o TICKETTAKER pertence ao usuário
            if (type !== "MASTER") {
                try {
                    const { users } = await this.findTicketsTakerByOwner.execute({ userOwnerUid });
                    const userExists = users.find(u => u.id === id || u.uid === id);
                    
                    if (!userExists) {
                        throw new UnauthorizedException("Não permitido desvincular este administrador.");
                    }
                } catch (error) {
                    console.error('Erro ao verificar permissão:', error);
                    throw new UnauthorizedException("Erro ao verificar permissões.");
                }
            }

            // Buscar o usuário TICKETTAKER para obter o email
            const ticketTakerUser = await this.prisma.user.findUnique({
                where: { uid: id }
            });

            if (!ticketTakerUser) {
                throw new Error('Usuário TICKETTAKER não encontrado.');
            }

            // Encontrar e deletar apenas a associação TicketTaker
            const ticketTaker = await this.prisma.ticketTaker.findFirst({
                where: {
                    userOwnerUid: userOwnerUid,
                    userTicketTakerUid: id
                }
            });

            if (!ticketTaker) {
                throw new Error('Associação não encontrada.');
            }

            // DEBUG LOGS
            console.log('TicketTaker a desvincular:', ticketTakerUser.email, ticketTakerUser.uid);

            // Buscar todos os eventos onde este TICKETTAKER está associado (pelo email no array)
            const eventsWithTicketTaker = await this.prisma.event.findMany({
                where: {
                    ticketTakers: {
                        has: ticketTakerUser.email
                    }
                }
            });

            console.log('Eventos encontrados para esse TicketTaker (pelo email):', eventsWithTicketTaker.map(e => ({ id: e.id, ticketTakers: e.ticketTakers })));

            // Remover o TICKETTAKER de todos os eventos onde está associado (pelo array)
            for (const event of eventsWithTicketTaker) {
                const updatedTicketTakers = event.ticketTakers.filter(
                    (takerEmail: string) => takerEmail !== ticketTakerUser.email
                );

                await this.prisma.event.update({
                    where: { id: event.id },
                    data: {
                        ticketTakers: updatedTicketTakers
                    }
                });
            }

            // Remover todas as associações na tabela eventsReceptionist para esse TicketTaker
            const allEventManagers = await this.prisma.eventsReceptionist.findMany({
                where: { useruid: id }
            });

            console.log('Associações na tabela eventsReceptionist antes da deleção:', allEventManagers.map(e => ({ id: e.id, eventId: e.eventId, useruid: e.useruid })));

            const deleteResult = await this.prisma.eventsReceptionist.deleteMany({
                where: { useruid: id }
            });

            console.log('Total de vínculos removidos da tabela eventsReceptionist:', deleteResult.count);

            // Para cada evento afetado, atualizar o campo ticketTakers
            for (const eventManager of allEventManagers) {
                // Buscar todos os vínculos ativos na tabela eventsReceptionist para esse evento
                const managers = await this.prisma.eventsReceptionist.findMany({
                    where: { eventId: eventManager.eventId },
                    include: { user: true }
                });

                // Atualizar o campo ticketTakers do evento
                const ticketTakers = managers.map(m => m.user.email);
                await this.prisma.event.update({
                    where: { id: eventManager.eventId },
                    data: { ticketTakers }
                });
            }

            // Verificar se ainda há vínculos após a deleção
            const allEventManagersAfter = await this.prisma.eventsReceptionist.findMany({
                where: { useruid: id }
            });

            console.log('Associações na tabela eventsReceptionist após deleção:', allEventManagersAfter.map(e => ({ id: e.id, eventId: e.eventId, useruid: e.useruid })));

            // Deletar apenas a associação, não o usuário
            await this.prisma.ticketTaker.delete({
                where: { id: ticketTaker.id }
            });

            return { 
                message: 'Administrador desvinculado com sucesso!',
                eventsUpdated: eventsWithTicketTaker.length,
                ticketTakerRemoved: {
                    name: ticketTakerUser.name,
                    email: ticketTakerUser.email
                }
            };

        } catch (error) {
            console.error('Erro ao desvincular ticket taker:', error);
            
            if (error.message.includes('Associação não encontrada')) {
                throw new BadRequestException('Associação não encontrada no sistema.');
            }
            
            if (error.message.includes('Usuário TICKETTAKER não encontrado')) {
                throw new BadRequestException('Usuário TICKETTAKER não encontrado no sistema.');
            }
            
            throw new InternalServerErrorException('Erro interno do servidor');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('users/search-ticket-takers')
    async searchTicketTakers(
      @Query('q') searchTerm: string,
      @Request() req: any
    ) {
      try {
        const user = req.user;
        
        // Verificar permissões
        if (!['MASTER', 'PROFESSIONAL_OWNER', 'PROFESSIONAL_PROMOTER'].includes(user.type)) {
          throw new UnauthorizedException('Acesso negado');
        }

        if (!searchTerm || searchTerm.trim().length < 2) {
          throw new BadRequestException('Termo de busca deve ter pelo menos 2 caracteres');
        }

        // Buscar TICKETTAKER que contenham o termo no nome ou email
        const ticketTakers = await this.prisma.user.findMany({
          where: {
            type: 'TICKETTAKER',
            isActive: true,
            OR: [
              {
                name: {
                  contains: searchTerm.trim(),
                  mode: 'insensitive'
                }
              },
              {
                email: {
                  contains: searchTerm.trim(),
                  mode: 'insensitive'
                }
              }
            ]
          },
                  select: {
          uid: true,
          name: true,
          email: true,
          type: true,
          isActive: true,
          createdAt: true
        },
          take: 10 // Limitar a 10 resultados
        });

        return {
          success: true,
          ticketTakers
        };
        
      } catch (error) {
        if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
          throw error;
        }
        
        // this.logger.error('Erro ao buscar TICKETTAKER:', error); // Assuming logger is available
        throw new InternalServerErrorException('Erro interno do servidor');
      }
    }

    @UseGuards(JwtAuthGuard)
    @Post('users/link-ticket-taker')
    async linkTicketTaker(
      @Body() body: { ticketTakerId: string },
      @Request() req: any
    ) {
      try {
        const user = req.user;
        
        // Verificar permissões
        if (!['MASTER', 'PROFESSIONAL_OWNER', 'PROFESSIONAL_PROMOTER'].includes(user.type)) {
          throw new UnauthorizedException('Acesso negado');
        }

        if (!body.ticketTakerId) {
          throw new BadRequestException('ID do TICKETTAKER é obrigatório');
        }

        if (!user.uid) {
          throw new BadRequestException('ID do usuário não encontrado');
        }

        // Verificar se o TICKETTAKER existe
        const ticketTaker = await this.prisma.user.findUnique({
          where: {
            uid: body.ticketTakerId,
            type: 'TICKETTAKER'
          }
        });

        if (!ticketTaker) {
          throw new BadRequestException('TICKETTAKER não encontrado');
        }

        // Verificar se já existe a associação
        const existingLink = await this.prisma.ticketTaker.findFirst({
          where: {
            userTicketTakerUid: body.ticketTakerId,
            userOwnerUid: user.uid
          }
        });

        if (existingLink) {
          throw new BadRequestException('Este administrador já está vinculado ao seu perfil');
        }

        // Criar a associação
        await this.prisma.ticketTaker.create({
          data: {
            userTicketTakerUid: body.ticketTakerId,
            userOwnerUid: user.uid
          }
        });

        return {
          success: true,
          message: 'Administrador vinculado com sucesso'
        };
        
      } catch (error) {
        if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
          throw error;
        }
        
        throw new InternalServerErrorException('Erro interno do servidor');
      }
    }

    // Endpoint para validação de tickets (função principal do TICKETTAKER)
    @UseGuards(JwtAuthGuard)
    @Post('tickets/validate')
    async validateTicket(@Req() req, @Body() body: { ticketId: string; qrCode: string }) {
        const { type } = req.user;

        // Apenas TICKETTAKER pode validar tickets
        if (type !== "TICKETTAKER") {
            throw new UnauthorizedException("Apenas administradores de eventos podem validar tickets.");
        }

        try {
            // TODO: Implementar lógica de validação de ticket
            // 1. Verificar se o QR Code é válido
            // 2. Verificar se o ticket não foi usado
            // 3. Verificar se o evento está ativo
            // 4. Marcar ticket como usado
            // 5. Retornar confirmação

            return {
                message: 'Ticket válido!',
                ticketId: body.ticketId,
                validated: true,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Erro ao validar ticket:', error);
            throw new Error('Erro interno do servidor');
        }
    }
}
