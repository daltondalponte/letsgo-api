import { Ticket } from "@application/ticket/entity/Ticket"
import { Ticket as RawTicket } from "@prisma/client"
import { Decimal } from "@prisma/client/runtime/library"


export class PrismaTicketMapper {
    static toPrisma(ticket: Ticket) {
        return {
            id: ticket.id,
            description: ticket.description,
            price: new Decimal(ticket.price),
            quantity_available: ticket.quantity_available,
            eventId: ticket.eventId,
            createdAt: ticket.createdAt,
            updatedAt: ticket.updatedAt
        }
    }

    static toDomain(rawTicket: RawTicket) {
        return new Ticket({
            description: rawTicket.description,
            eventId: rawTicket.eventId,
            price: Number(rawTicket.price),
            quantity_available: rawTicket.quantity_available,
            createdAt: rawTicket.createdAt,
            updatedAt: rawTicket.updatedAt
        }, rawTicket.id)
    }
}