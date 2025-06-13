
import { EventManager } from "@application/event-manager/entity/EventManager";
import { EventsManager as RawEventManager } from "@prisma/client";

export class PrismaEventManagerMapper {
    static toPrisma(eventManager: EventManager) {
        return {
            id: eventManager.id,
            useruid: eventManager.useruid,
            eventId: eventManager.eventId,
            recursos: eventManager.recursos,
            createdAt: eventManager.createdAt,
            updatedAt: eventManager.updatedAt
        }
    }

    static toDomain(rawEventManager: RawEventManager) {
        return new EventManager({
            eventId: rawEventManager.eventId,
            recursos: rawEventManager.recursos,
            useruid: rawEventManager.useruid,
            createdAt: rawEventManager.createdAt,
            updatedAt: rawEventManager.updatedAt
        }, rawEventManager.id)
    }
}