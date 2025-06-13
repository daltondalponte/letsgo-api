import { Injectable, BadRequestException } from "@nestjs/common";
import { EventManager, EventManagerProps } from "../entity/EventManager";
import { EventManagerRepository } from "../repositories/event-manager-repository";
import { Recurso } from "@prisma/client";

interface EventManagerRequest {
    recursos: Recurso[];
    id: string
}

interface EventManagerResponse {
    eventManager: EventManager
}

@Injectable()
export class UpdateEventManager {

    constructor(
        private eventManagerRepository: EventManagerRepository
    ) { }

    async execute(request: EventManagerRequest): Promise<EventManagerResponse> {

        const { recursos, id } = request

        const eventManager = await this.eventManagerRepository.findById(id)

        if (!eventManager) throw new BadRequestException("Não encontrado")

        const eventManagerEdited = new EventManager({
            eventId: eventManager.eventId,
            recursos,
            useruid: eventManager.useruid,
            createdAt: eventManager.createdAt
        }, eventManager.id)

        await this.eventManagerRepository.save(eventManagerEdited)

        return { eventManager: eventManagerEdited }
    }
}