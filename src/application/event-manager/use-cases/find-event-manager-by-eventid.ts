import { Injectable } from "@nestjs/common";
import { EventManager } from "../entity/EventManager";
import { EventManagerRepository } from "../repositories/event-manager-repository";
import { User } from "@application/user/entity/User";

interface EventManagerRequest {
    eventId: string;
}

@Injectable()
export class FindEventManagerByEventId {

    constructor(
        private eventManagerRepository: EventManagerRepository
    ) { }

    async execute(request: EventManagerRequest): Promise<EventManager[]> {

        const { eventId } = request

        const eventManagers = await this.eventManagerRepository.findByEventId(eventId)

        return eventManagers
    }
}