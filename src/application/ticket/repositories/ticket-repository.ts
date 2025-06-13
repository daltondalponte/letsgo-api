import { Ticket } from "../entity/Ticket";

export abstract class TicketRepository {
    abstract create(ticket: Ticket): Promise<void>;
    abstract createCreateMany(tickets: Ticket[]): Promise<void>;
    abstract createPurchase(ticketId: string, userId: string, paymentId: string, cupomId?: string): Promise<string>;
    abstract findPurchaseUserId(userId: string): Promise<any[] | null>;
    abstract findPurchaseById(id: string): Promise<any | null>;
    abstract findByEventId(userOwnerUid: string): Promise<any | null>;
    abstract findByEventAdminId(findByEventAdminId: string): Promise<any | null>;
    abstract findByUserUid(uid: string): Promise<any | null>;
    abstract findById(id: string): Promise<any | null>;
    abstract findByIdIncludeOwnerEventStripeDetail(id: string, code?: string): Promise<any>
    abstract findAll(): Promise<any[]>; // Adicionado para a Dashboard Master
    abstract save(ticket: Ticket): Promise<void>;
    abstract savePurchase(id: string): Promise<void>;
}
