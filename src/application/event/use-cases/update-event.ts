import { Injectable } from "@nestjs/common";
import { Coord, Event } from "../entity/Event";
import { EventRepository } from "../repositories/event-repository";
import { UnauthorizedException } from "@nestjs/common"

interface EventRequest {
    id: string;
    establishmentId: string;
    name?: string;
    description?: string;
    photos?: string[];
    isActive?: boolean
}

interface EventResponse {
    event: Event
}

@Injectable()
export class UpdateEvent {

    constructor(
        private eventRepository: EventRepository
    ) { }

    async execute(request: EventRequest): Promise<EventResponse> {
        const { description, photos, name, id, establishmentId, isActive } = request

        const event = await this.eventRepository.findById(id)

        if (event.establishmentId !== establishmentId) {
            throw new UnauthorizedException("Acesso negado!")
        }

        const eventToEdit = new Event({
            ticketTakers: event.ticketTakers,
            dateTimestamp: event.dateTimestamp,
            description: description ?? event.description,
            name: name ?? event.name,
            useruid: event.useruid,
            coordinates_event: event.coord,
            address: event.address,
            listNames: event.listNames,
            establishmentId: event.establishmentId,
            photos: photos ?? event.photos,
            isActive: isActive ?? event.isActive,
            createdAt: event.createdAt
        }, event.id)

        await this.eventRepository.save(eventToEdit)

        return { event: eventToEdit }
    }
}