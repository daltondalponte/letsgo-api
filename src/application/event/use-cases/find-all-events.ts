import { Injectable } from "@nestjs/common";
import { EventRepository } from "@application/event/repositories/event-repository";

interface FindAllEventsResponse {
    events: any[];
}

@Injectable()
export class FindAllEvents {
    constructor(private eventRepository: EventRepository) {}

    async execute(): Promise<FindAllEventsResponse> {
        const events = await this.eventRepository.findAll();
        
        return {
            events
        };
    }
}
