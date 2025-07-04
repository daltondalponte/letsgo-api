import { Controller, Body, UseGuards, Post, Get, Request, Put, Param, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { CreateEventManager } from '@application/event-manager/use-cases/create-event-manager';
import { FindEventManagerByEventId } from '@application/event-manager/use-cases/find-event-manager-by-eventid';
import { FindEventManagerById } from '@application/event-manager/use-cases/find-event-manager-by-id';
import { DeleteEventManager } from '@application/event-manager/use-cases/delete-event-manager';
import { UpdateEventManager } from '@application/event-manager/use-cases/update-event-manager';
import { EventManagerViewModel } from '../view-models/event-manager/event-manager-view-model';
import { EnsureProfessionalUser } from '../auth/guards/ensure-professional-user.guard';
import { EnsureOwnerEvent } from '../auth/guards/ensure-owner-event.guard';
import { FindUserByEmail } from '@application/user/use-cases/find-user-by-email';
import { CreateUser } from '@application/user/use-cases/create-user';
import { User } from '@application/user/entity/User';

@ApiTags("Event Manager")
@Controller("event-manager")
export class EventManagerController {

    constructor(
        private createEventManager: CreateEventManager,
        private findEventManagerByEventId: FindEventManagerByEventId,
        private findEventManagerById: FindEventManagerById,
        private deleteEventManager: DeleteEventManager,
        private updateEventManager: UpdateEventManager,
        private findUserByEmail: FindUserByEmail,
        private createUser: CreateUser
    ) { }

    @UseGuards(JwtAuthGuard, EnsureProfessionalUser)
    @Post("create")
    async create(@Request() req, @Body() body: any) {
        const { userId: useruid } = req.user;
        const { email, eventId, recursos } = body;

        // Verificar se o usuário já existe
        let user: User;
        try {
            const existingUser = await this.findUserByEmail.execute({ email });
            user = existingUser.user;
        } catch (error) {
            // Se o usuário não existe, criar um novo
            const newUser = await this.createUser.execute({
                name: email.split('@')[0], // Nome temporário baseado no email
                email,
                password: Math.random().toString(36).slice(-8), // Senha temporária
                type: "TICKETTAKER" // Tipo de usuário para administradores de eventos
            });
            user = newUser.user;
        }

        const { eventManager } = await this.createEventManager.execute({
            eventId,
            recursos,
            useruid: user.id
        });

        return { 
            eventManager: EventManagerViewModel.toHTTP(eventManager),
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get("find-by-event/:eventId")
    async findByEventId(@Param("eventId") eventId: string, @Request() req) {
        const managers = await this.findEventManagerByEventId.execute({ eventId });

        return {
            managers: managers.map(m => ({
                ...EventManagerViewModel.toHTTP(m.eventManager),
                user: {
                    id: m.user.id,
                    name: m.user.name,
                    email: m.user.email
                }
            }))
        };
    }

    @UseGuards(JwtAuthGuard, EnsureProfessionalUser)
    @Delete("delete/:id")
    async delete(@Param("id") id: string, @Request() req) {
        // Buscar o event manager para obter eventId e useruid
        const { eventManager } = await this.findEventManagerById.execute({ id });
        
        await this.deleteEventManager.execute({
            eventId: eventManager.eventId,
            useruid: eventManager.useruid
        });

        return { message: "Administrador removido com sucesso" };
    }

    @UseGuards(JwtAuthGuard, EnsureProfessionalUser)
    @Put("update/:id")
    async update(@Param("id") id: string, @Request() req, @Body() body: any) {
        const { recursos } = body;

        const { eventManager } = await this.updateEventManager.execute({
            id,
            recursos
        });

        return { eventManager: EventManagerViewModel.toHTTP(eventManager) };
    }
}
