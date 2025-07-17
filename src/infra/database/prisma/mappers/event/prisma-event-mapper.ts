import { Event as PrismaEvent } from "@prisma/client";
import { Event } from "@application/event/entity/Event";

export class PrismaEventMapper {
    static toPrisma(event: Event) {
        return {
            name: event.name,
            dateTimestamp: event.dateTimestamp,
            endTimestamp: event.endTimestamp,
            description: event.description,
            photos: event.photos,
            listNames: event.listNames || [],
            address: event.address || null,
            isActive: event.isActive,
            coordinates_event: event.coordinates_event,
            ...(event.establishmentId && { establishment: { connect: { id: event.establishmentId } } }),
            ...(event.useruid && { user: { connect: { uid: event.useruid } } })
        };
    }

    static toDomain(rawEvent: PrismaEvent): Event {
        return new Event({
            id: rawEvent.id,
            name: rawEvent.name,
            dateTimestamp: rawEvent.dateTimestamp,
            endTimestamp: rawEvent.endTimestamp,
            description: rawEvent.description,
            photos: rawEvent.photos,
            listNames: rawEvent.listNames || undefined,
            address: rawEvent.address,
            establishmentId: rawEvent.establishmentId,
            useruid: rawEvent.useruid,
            isActive: rawEvent.isActive,
            coordinates_event: rawEvent.coordinates_event as any,
        });
    }
}