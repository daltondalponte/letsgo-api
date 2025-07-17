import { Injectable } from "@nestjs/common";
import { Event } from "../entity/Event";
import { EventRepository } from "../repositories/event-repository";
import { UnauthorizedException } from "@nestjs/common"

interface UpdateEventRequest {
    id: string;
    name?: string;
    description?: string;
    photos?: string[];
    isActive?: boolean;
    establishmentId?: string;
}

interface UpdateEventResponse {
    event: Event;
}

@Injectable()
export class UpdateEvent {
    constructor(private eventRepository: EventRepository) { }

    async execute(request: UpdateEventRequest): Promise<UpdateEventResponse> {
        const { id, name, description, photos, isActive, establishmentId } = request;

        const event = await this.eventRepository.findById(id);

        if (name) {
            event.name = name;
        }

        if (description) {
            event.description = description;
        }

        if (photos) {
            event.photos = photos;
        }

        if (isActive !== undefined) {
            event.isActive = isActive;
        }

        if (establishmentId) {
            event.establishmentId = establishmentId;
        }

        await this.eventRepository.save(event);

        return { event };
    }
}