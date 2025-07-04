import { Controller, Body, UseGuards, Post, Get, Request, Put, Param, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateEvent } from '@application/event/use-cases/create-event';
import { FindEventsByUserUidOrEstablishmentId } from '@application/event/use-cases/find-many-by-user';
import { FindEventById } from '@application/event/use-cases/find-event-by-id';
import { UpdateEvent } from '@application/event/use-cases/update-event';
import { EventViewModel } from '../view-models/event/event-view-model';
import { ApiTags } from '@nestjs/swagger';
import { EnsureProfessionalUser } from '../auth/guards/ensure-professional-user.guard';

@ApiTags("Evento")
@Controller("event")
export class EventController {

    constructor(
        private createEvent: CreateEvent,
        private findEventsByUserUidOrEstablishmentId: FindEventsByUserUidOrEstablishmentId,
        private findEventById: FindEventById,
        private updateEvent: UpdateEvent
    ) { }

    @UseGuards(JwtAuthGuard, EnsureProfessionalUser)
    @Post("create")
    async create(@Request() req, @Body() body: any) {
        const { userId: useruid } = req.user

        const { name, description, dateTimestamp, establishmentId, address, coordinates_event, photos = [], isActive = true } = body

        const { event } = await this.createEvent.execute({
            name,
            description,
            dateTimestamp,
            establishmentId: establishmentId || null,
            address: address || null,
            coordinates_event: coordinates_event || null,
            useruid,
            photos,
            isActive
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
    @Get("find-many-by-user")
    async findManyByUser(@Request() req) {
        const { userId: useruid } = req.user

        const { events } = await this.findEventsByUserUidOrEstablishmentId.execute({ useruid })

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
}
