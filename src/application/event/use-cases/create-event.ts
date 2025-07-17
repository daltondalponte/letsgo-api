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
    endTimestamp?: string;
    description: string;
    listNames?: string[]
    photos: string[]
    isActive: boolean
    tickets?: Array<{
        category: string;
        price: number;
        quantity: number;
    }>
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

        const { dateTimestamp, endTimestamp, description, photos, address, establishmentId, useruid, coordinates_event, listNames, name, isActive, tickets } = request

        const event = new Event({
            name,
            dateTimestamp: new Date(dateTimestamp),
            endTimestamp: endTimestamp ? new Date(endTimestamp) : undefined,
            description,
            photos,
            listNames,
            address,
            establishmentId,
            useruid,
            isActive,
            coordinates_event
        })

        await this.eventRepository.create(event, tickets)

        return { event }
    }
}