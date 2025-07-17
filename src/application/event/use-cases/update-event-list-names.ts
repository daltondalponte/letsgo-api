import { Injectable } from "@nestjs/common";
import { Event } from "../entity/Event";
import { EventRepository } from "../repositories/event-repository";

interface UpdateEventListNamesRequest {
    id: string;
    listNames: string[];
}

interface UpdateEventListNamesResponse {
    event: Event;
}

@Injectable()
export class UpdateEventListNames {
    constructor(private eventRepository: EventRepository) { }

    async execute(request: UpdateEventListNamesRequest): Promise<UpdateEventListNamesResponse> {
        const { id, listNames } = request;

        const event = await this.eventRepository.findById(id);

        event.listNames = listNames;

        await this.eventRepository.save(event);

        return { event };
    }
}