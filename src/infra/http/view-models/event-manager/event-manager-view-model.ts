import { EventManager } from "@application/event-manager/entity/EventManager";

export class EventManagerViewModel {

    static toHTTP(eventManager: EventManager) {
        return {
            id: eventManager.id,
            recursos: eventManager.recursos,
            eventId: eventManager.eventId,
            createdAt: eventManager.createdAt,
            updatedAt: eventManager.updatedAt
        }
    }
}