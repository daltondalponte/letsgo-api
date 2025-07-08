import { Event } from "@application/event/entity/Event";

export class EventViewModel {

    static toHTTP(event: Event & { managers?: any[], tickets?: any[], establishment?: any, creator?: any }) {
        return {
            id: event.id,
            name: event.name,
            description: event.description,
            address: event.address,
            dateTimestamp: event.dateTimestamp,
            endTimestamp: event.endTimestamp,
            photos: event.photos,
            coordinates_event: event.coord,
            ticketTakers: event.ticketTakers,
            listNames: event.listNames,
            useruid: event.useruid,
            establishmentId: event.establishmentId,
            createdAt: event.createdAt,
            updatedAt: event.updatedAt,
            isActive: event.isActive,
            managers: event.managers || [],
            tickets: event.tickets || [],
            establishment: event.establishment || null,
            creator: event.creator || null
        }
    }
}