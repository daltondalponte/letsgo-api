import { Injectable } from "@nestjs/common";
import { Coord, Event } from "../entity/Event";
import { EventRepository } from "../repositories/event-repository";
import { UnauthorizedException } from "@nestjs/common"

interface EventRequest {
    id: string;
    establishmentId: string;
    listNames: string[];
}

@Injectable()
export class UpdateEventListNames {

    constructor(
        private eventRepository: EventRepository
    ) { }

    async execute(request: EventRequest): Promise<void> {
        const { listNames, id, establishmentId } = request

        const event = await this.eventRepository.findById(id)

        if (event.establishmentId !== establishmentId) {
            throw new UnauthorizedException("Acesso negado!")
        }

        const eventToEdit = new Event({
            ticketTakers: event.ticketTakers,
            dateTimestamp: event.dateTimestamp,
            description: event.description,
            name: event.name,
            useruid: event.useruid,
            coordinates_event: event.coord,
            address: event.address,
            listNames,
            establishmentId: event.establishmentId,
            photos: event.photos,
            isActive: event.isActive,
            createdAt: event.createdAt
        }, event.id)

        await this.eventRepository.save(eventToEdit)
    }
}