import { Injectable } from "@nestjs/common";
import { Event } from "../entity/Event";
import { EventRepository } from "../repositories/event-repository";

interface EventRequest {
    useruid?: string;
    establishmentId?: string
}

interface EventResponse {
    events: any[]
}

@Injectable()
export class FindEventsByUserUidOrEstablishmentId {

    constructor(
        private eventRepository: EventRepository
    ) { }

    async execute(request: EventRequest): Promise<EventResponse> {
        const { establishmentId, useruid } = request

        const events = await this.eventRepository.findManyByUserUidOrEstablishmentId(useruid, establishmentId)

        return { events }
    }
}