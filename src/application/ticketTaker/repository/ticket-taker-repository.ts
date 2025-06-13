import { User } from "@application/user/entity/User";
import { TicketTaker } from "../entity/TicketTaker";

export abstract class TicketTakerRepository {
    abstract create(ticketTaker: TicketTaker): Promise<void>;
    abstract findByOwnerId(ownerId: string): Promise<User[] | null>;
    abstract userTicketTakerUid(userTicketTakerUid: string): Promise<TicketTaker[] | null>;
    abstract findById(id: string): Promise<TicketTaker | null>;
    abstract findByUserTakerId(id: string): Promise<TicketTaker | null>;
    abstract save(Ticket: TicketTaker): Promise<TicketTaker | null>;  
    abstract delete(id: string): Promise<void>;
}