import { Injectable } from "@nestjs/common";
import { EventManager } from "../entity/EventManager";
import { EventManagerRepository } from "../repositories/event-manager-repository";
import { Establishment } from "@application/establishment/entity/Establishment";
import { Event } from "@application/event/entity/Event";

interface EventManagerRequest {
    useruid: string;
}


@Injectable()
export class FindEventManagerByUserUid {

    constructor(
        private eventManagerRepository: EventManagerRepository
    ) { }

    async execute(request: EventManagerRequest): Promise<{ eventManager: EventManager, event: Event, establishment: Establishment }[]> {

        const { useruid } = request

        const eventManagerData = await this.eventManagerRepository.findByUserUid(useruid)

        return eventManagerData.map(e => {
            return {
                eventManager: e.eventManager,
                event: e.event,
                establishment: e.establishment
            }
        })
    }
}