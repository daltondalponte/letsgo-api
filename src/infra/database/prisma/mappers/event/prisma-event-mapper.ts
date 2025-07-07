import { Event } from "@application/event/entity/Event";
import { Event as RawEvent } from "@prisma/client";


export class PrismaEventMapper {
    static toPrisma(event: Event) {
        return {
            id: event.id,
            name: event.name,
            useruid: event.useruid,
            coordinates_event: event.coord ? JSON.stringify(event.coord) : null,
            address: event.address || null,
            listNames: event.listNames || [],
            ticketTakers: event.ticketTakers || [],
            dateTimestamp: event.dateTimestamp,
            endTimestamp: event.endTimestamp || null,
            description: event.description,
            establishmentId: event.establishmentId || null,
            photos: event.photos || [],
            isActive: event.isActive,
            createdAt: event.createdAt,
            updatedAt: event.updatedAt
        }
    }

    static toDomain(rawEvent: RawEvent) {
        return new Event({
            name: rawEvent.name,
            dateTimestamp: rawEvent.dateTimestamp.toISOString(),
            endTimestamp: rawEvent.endTimestamp ? rawEvent.endTimestamp.toISOString() : undefined,
            coordinates_event: rawEvent.coordinates_event ? JSON.parse(rawEvent.coordinates_event as string) : undefined,
            listNames: rawEvent.listNames || undefined,
            ticketTakers: rawEvent.ticketTakers || undefined,
            description: rawEvent.description,
            photos: rawEvent.photos || [],
            address: rawEvent.address || undefined,
            establishmentId: rawEvent.establishmentId || undefined,
            useruid: rawEvent.useruid,
            isActive: rawEvent.isActive,
            createdAt: rawEvent.createdAt,
            updatedAt: rawEvent.updatedAt
        }, rawEvent.id)
    }
}