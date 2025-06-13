import { Injectable } from "@nestjs/common";
import { EventManager, EventManagerProps } from "../entity/EventManager";
import { EventManagerRepository } from "../repositories/event-manager-repository";

interface EventManagerRequest extends Omit<EventManagerProps, "createdAt" | "updatedAt"> { }

interface EventManagerResponse {
    eventManager: EventManager
}

@Injectable()
export class CreateEventManager {

    constructor(
        private eventManagerRepository: EventManagerRepository

    ) { }

    async execute(request: EventManagerRequest): Promise<EventManagerResponse> {

        const { eventId, recursos, useruid } = request

        const eventManager = new EventManager({
            eventId,
            recursos,
            useruid
        })

        await this.eventManagerRepository.create(eventManager)

        return { eventManager }
    }
}