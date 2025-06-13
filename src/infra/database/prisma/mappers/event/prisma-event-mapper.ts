import { Event } from "@application/event/entity/Event";
import { Event as RawEvent } from "@prisma/client";


export class PrismaEventMapper {
    static toPrisma(event: Event) {
        return {
            id: event.id,
            name: event.name,
            useruid: event.useruid,
            coordinates_event: JSON.stringify(event.coord),
            address: event.address,
            listNames: event.listNames,
            ticketTakers: event.ticketTakers,
            dateTimestamp: event.dateTimestamp,
            description: event.description,
            establishmentId: event.establishmentId,
            photos: event.photos,
            isActive: event.isActive,
            createdAt: event.createdAt,
            updatedAt: event.updatedAt
        }
    }

    static toDomain(rawEvent: RawEvent) {
        return new Event({
            name: rawEvent.name,
            dateTimestamp: rawEvent.dateTimestamp.toISOString(),
            coordinates_event: JSON.parse(rawEvent.coordinates_event as string),
            listNames: rawEvent.listNames,
            ticketTakers: rawEvent.ticketTakers,
            description: rawEvent.description,
            photos: rawEvent.photos,
            address: rawEvent.address,
            establishmentId: rawEvent.establishmentId,
            useruid: rawEvent.useruid,
            isActive: rawEvent.isActive,
            createdAt: rawEvent.createdAt,
            updatedAt: rawEvent.updatedAt
        }, rawEvent.id)
    }
}