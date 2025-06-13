import { Injectable } from "@nestjs/common";
import { Event } from "../entity/Event";
import { EventRepository } from "../repositories/event-repository";

interface EventRequest {
    id: string
}

interface EventResponse {
    event: Event
}

@Injectable()
export class FindEventById {

    constructor(
        private eventRepository: EventRepository
    ) { }

    async execute(request: EventRequest): Promise<EventResponse> {
        const { id } = request

        const event = await this.eventRepository.findById(id)

        return { event }
    }
}