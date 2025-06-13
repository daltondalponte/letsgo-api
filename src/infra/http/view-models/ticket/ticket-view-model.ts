import { Ticket } from "@application/ticket/entity/Ticket";

export class TicketViewModel {

    static toHTTP(ticket: Ticket) {
        return {
            id: ticket.id,
            description: ticket.description,
            eventId: ticket.eventId,
            useruid: ticket.useruid,
            price: ticket.price,
            quantity_available: ticket.quantity_available,
            createdAt: ticket.createdAt,
            updatedAt: ticket.updatedAt
        }
    }
}