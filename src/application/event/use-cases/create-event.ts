import { Injectable } from "@nestjs/common";
import { Coord, Event } from "../entity/Event";
import { EventRepository } from "../repositories/event-repository";
import { EstablishmentRepository } from "@application/establishment/repositories/establishment-repository";

interface EventRequest {
    name: string;
    address?: string,
    useruid?: string,
    coordinates_event?: Coord;
    establishmentId?: string;
    dateTimestamp: string;
    description: string;
    ticketTakers?: string[]
    listNames?: string[]
    photos: string[]
    isActive: boolean
}

interface EventResponse {
    event: Event
}

@Injectable()
export class CreateEvent {

    constructor(
        private eventRepository: EventRepository

    ) { }

    async execute(request: EventRequest): Promise<EventResponse> {

        const { dateTimestamp, description, photos, address, establishmentId, useruid, coordinates_event, listNames, ticketTakers, name, isActive } = request

        const event = new Event({
            name,
            dateTimestamp,
            description,
            photos,
            listNames,
            ticketTakers,
            address,
            establishmentId,
            useruid,
            isActive,
            coordinates_event
        })

        await this.eventRepository.create(event)

        return { event }
    }
}