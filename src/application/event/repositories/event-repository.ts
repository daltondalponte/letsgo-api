import { EventApprovalRequest } from "@application/event-manager/use-cases/create-event-approval";
import { Event } from "../entity/Event";

export abstract class EventRepository {
    abstract create(event: Event, tickets?: Array<{category: string; price: number; quantity: number}>): Promise<void>;
    abstract createApproval(event: EventApprovalRequest): Promise<void>;
    abstract findManyByUserUidOrEstablishmentId(useruid?: string, establishmentId?: string, approvedOnly?: boolean): Promise<Event[] | null>;
    abstract findByUserUid(uid: string): Promise<Event[] | null>;
    abstract findById(id: string): Promise<Event | null>;
    abstract findAll(): Promise<Event[]>; // Adicionado para a Dashboard Master
    abstract save(event: Event): Promise<void>;
    abstract findPendingApprovals(establishmentId: string): Promise<any[]>;
    abstract approveEvent(eventId: string, useruid: string): Promise<void>;
    abstract rejectEvent(eventId: string, useruid: string): Promise<void>;
}