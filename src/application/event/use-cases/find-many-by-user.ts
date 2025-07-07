import { Injectable } from "@nestjs/common";
import { Event } from "../entity/Event";
import { EventRepository } from "../repositories/event-repository";

interface EventRequest {
    useruid?: string;
    establishmentId?: string;
    approvedOnly?: boolean;
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
        const { establishmentId, useruid, approvedOnly } = request

        const events = await this.eventRepository.findManyByUserUidOrEstablishmentId(useruid, establishmentId, approvedOnly)

        return { events }
    }
}