import { Cupom } from "../entity/Cupom";

export abstract class CupomRepository {
    abstract create(cupom: Cupom): Promise<void>;
    abstract findByTicketId(ticketId: string): Promise<Cupom[] | null>;
    abstract findByTicketIdAndCode(ticketId: string, code: string, eventId: string): Promise<Cupom | null>;
    abstract findManyByEventId(eventId: string): Promise<Cupom[] | null>;
    abstract attachCupomTicket(cupomId: string, ticketId: string): Promise<void>;
    abstract dettachCupomTicket(cupomId: string, ticketId: string): Promise<void>;
    abstract findById(id: string): Promise<Cupom | null>;
    abstract save(cupom: Cupom): Promise<void>;
    abstract delete(id: string): Promise<void>;
}