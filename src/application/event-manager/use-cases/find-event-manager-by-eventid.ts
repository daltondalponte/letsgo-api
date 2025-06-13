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

    async execute(request: EventManagerRequest): Promise<{ eventManager: EventManager, user: User }[]> {

        const { eventId } = request

        const eventManagerData = await this.eventManagerRepository.findByEventId(eventId)

        return eventManagerData.map(e => {
            return {
                eventManager: e.eventManager,
                user: e.user
            }
        })
    }
}