import { Event } from "@application/event/entity/Event";
import { EventManager } from "../entity/EventManager";
import { Establishment } from "@application/establishment/entity/Establishment";
import { User } from "@application/user/entity/User";

export abstract class EventManagerRepository {
    abstract create(event: EventManager): Promise<void>;
    abstract findByUserUid(useruid: string): Promise<{ eventManager: EventManager, event: Event, establishment: Establishment }[] | null>;
    abstract findByEventId(eventId: string): Promise<{ eventManager: EventManager, user: User, }[] | null>;
    abstract findById(id: string): Promise<EventManager | null>;
    abstract save(event: EventManager): Promise<void>;
    abstract delete(eventId: string, useruid: string): Promise<void>;
}