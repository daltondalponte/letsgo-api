import { Injectable } from "@nestjs/common";
import { EventRepository } from "../repositories/event-repository";

interface ApproveEventRequest {
    eventId: string;
    useruid: string;
}

@Injectable()
export class ApproveEvent {

    constructor(
        private eventRepository: EventRepository
    ) { }

    async execute(request: ApproveEventRequest): Promise<void> {
        const { eventId, useruid } = request;

        await this.eventRepository.approveEvent(eventId, useruid);
    }
} 