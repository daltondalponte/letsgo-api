import { Injectable } from "@nestjs/common";
import { EventRepository } from "../repositories/event-repository";

interface RejectEventRequest {
    eventId: string;
    useruid: string;
}

@Injectable()
export class RejectEvent {

    constructor(
        private eventRepository: EventRepository
    ) { }

    async execute(request: RejectEventRequest): Promise<void> {
        const { eventId, useruid } = request;

        await this.eventRepository.rejectEvent(eventId, useruid);
    }
} 