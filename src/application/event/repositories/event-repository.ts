import { EventApprovalRequest } from "@application/event-manager/use-cases/create-event-approval";
import { Event } from "../entity/Event";

export abstract class EventRepository {
    abstract create(event: Event): Promise<void>;
    abstract createApproval(event: EventApprovalRequest): Promise<void>;
    abstract findManyByUserUidOrEstablishmentId(useruid?: string, establishmentId?: string): Promise<Event[] | null>;
    abstract findByUserUid(uid: string): Promise<Event[] | null>;
    abstract findById(id: string): Promise<Event | null>;
    abstract findAll(): Promise<Event[]>; // Adicionado para a Dashboard Master
    abstract save(event: Event): Promise<void>;
}