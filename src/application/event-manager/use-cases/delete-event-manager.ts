import { Injectable } from "@nestjs/common";
import { EventManagerRepository } from "../repositories/event-manager-repository";

interface EventManagerRequest {
    eventId: string;
    useruid: string;
}

@Injectable()
export class DeleteEventManager {

    constructor(
        private eventManagerRepository: EventManagerRepository

    ) { }

    async execute(request: EventManagerRequest): Promise<void> {

        const { eventId, useruid } = request

        await this.eventManagerRepository.delete(eventId, useruid)

    }
}