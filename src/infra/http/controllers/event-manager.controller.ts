import { Controller, Body, UseGuards, Post, Get, Request, Param, Delete, BadRequestException } from '@nestjs/common';
import { EventViewModel } from '../view-models/event/event-view-model';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { EnsureProfessionalUser } from '../auth/guards/ensure-professional-user.guard';
import { FirebaseService } from '@infra/database/firebase/firebase.service';
import { EnsureOwnerEvent } from '../auth/guards/ensure-owner-event.guard';
import { CreateEventManager } from '@application/event-manager/use-cases/create-event-manager';
import { FindEventManagerByUserUid } from '@application/event-manager/use-cases/find-event-manager-by-userid';
import { EventManagerBody } from '../dtos/event-manager/create-event-manager-body';
import { EventManagerViewModel } from '../view-models/event-manager/event-manager-view-model';
import { UpdateEventManager } from '@application/event-manager/use-cases/update-event-manager';
import { EstablishmentViewModel } from '../view-models/establishment/establishment-view-model';
import { DeleteEventManager } from '@application/event-manager/use-cases/delete-event-manager';
import { FindUserByEmail } from '@application/user/use-cases/find-user-by-email';
import { FindEventManagerByEventId } from '@application/event-manager/use-cases/find-event-manager-by-eventid';
import { UserViewModel } from '../view-models/user/user-view-model';

@ApiTags("Gerente de Evento")
@Controller("events-manager")
export class EventManagerController {

    constructor(
        private createEventManager: CreateEventManager,
        private updateEventManager: UpdateEventManager,
        private findEventManagerByUserUid: FindEventManagerByUserUid,
        private findEventManagerByEventId: FindEventManagerByEventId,
        private deleteEventManager: DeleteEventManager,
        private findUserByEmail: FindUserByEmail
    ) { }

    @UseGuards(JwtAuthGuard, EnsureOwnerEvent)
    @Post("create")
    async create(@Request() req, @Body() body: EventManagerBody) {
        const { eventId, recursos, email } = body

        const { user } = await this.findUserByEmail.execute({
            email
        })

        if (!user || user.type !== "PROFESSIONAL") {
            throw new BadRequestException("Usuário não encontrado ou não é válido para gerenciar um evento")
        }

        const { eventManager } = await this.createEventManager.execute({
            eventId,
            recursos,
            useruid: user.id
        })

        return { eventManager: EventManagerViewModel.toHTTP(eventManager) }
    }

    @UseGuards(JwtAuthGuard, EnsureOwnerEvent)
    @Post("update/:id")
    async update(@Param('id') id, @Request() req, @Body() body: EventManagerBody) {
        const { userId: useruid } = req.user
        const { recursos } = body

        const { eventManager } = await this.updateEventManager.execute(
            {
                id,
                recursos
            }
        )

        return { eventManager: EventManagerViewModel.toHTTP(eventManager) }
    }

    @UseGuards(JwtAuthGuard, EnsureProfessionalUser)
    @Get("find-many-by-user")
    async findEventsByUserUid(@Request() req) {
        const { userId: useruid } = req.user

        const eventsManager = await this.findEventManagerByUserUid.execute({ useruid })

        return eventsManager.map(e => ({
            eventManager: EventManagerViewModel.toHTTP(e.eventManager),
            event: EventViewModel.toHTTP(e.event),
            establishment: EstablishmentViewModel.toHTTP(e.establishment)
        }))
    }

    @UseGuards(JwtAuthGuard, EnsureProfessionalUser)
    @Get("web/find-many-by-user")
    async findEventsByUserUidWeb(@Request() req) {
        const { userId: useruid } = req.user

        const eventsManager = await this.findEventManagerByUserUid.execute({ useruid })

        return eventsManager.map(e => ({
              ...EventViewModel.toHTTP(e.event),
            eventManager: EventManagerViewModel.toHTTP(e.eventManager),
            establishment: EstablishmentViewModel.toHTTP(e.establishment)
        }))
    }

    @UseGuards(JwtAuthGuard, EnsureOwnerEvent)
    @Get("find-many-by-event/:eventId")
    async findEventsByEvent(@Param("eventId") id, @Request() req) {

        const eventsManager = await this.findEventManagerByEventId.execute({ eventId: id })

        return eventsManager.map(e => ({
            eventManager: EventManagerViewModel.toHTTP(e.eventManager),
            user: UserViewModel.toHTTP(e.user)
        }))
    }

    @UseGuards(JwtAuthGuard, EnsureOwnerEvent)
    @Get("find-many-by-event/:eventId")
    async findUsersByEventId(@Request() req) {
        const { userId: useruid } = req.user

        const eventsManager = await this.findEventManagerByUserUid.execute({ useruid })

        return eventsManager.map(e => ({
            eventManager: EventManagerViewModel.toHTTP(e.eventManager),
            event: EventViewModel.toHTTP(e.event),
            establishment: EstablishmentViewModel.toHTTP(e.establishment)
        }))
    }

    @UseGuards(JwtAuthGuard, EnsureOwnerEvent)
    @Delete("delete/:eventId/:useruid")
    async delete(@Param('eventId') eventId, @Param('useruid') useruid, @Request() req) {

        await this.deleteEventManager.execute({
            eventId,
            useruid
        })
        return "sucesso"
    }
}
