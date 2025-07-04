import { Injectable } from "@nestjs/common";
import { EventManager } from "../entity/EventManager";
import { EventManagerRepository } from "../repositories/event-manager-repository";

interface EventManagerRequest {
    id: string;
}

interface EventManagerResponse {
    eventManager: EventManager;
}

@Injectable()
export class FindEventManagerById {

    constructor(
        private eventManagerRepository: EventManagerRepository
    ) { }

    async execute(request: EventManagerRequest): Promise<EventManagerResponse> {
        const { id } = request;

        const eventManager = await this.eventManagerRepository.findById(id);

        if (!eventManager) {
            throw new Error("Event Manager não encontrado");
        }

        return { eventManager };
    }
} 