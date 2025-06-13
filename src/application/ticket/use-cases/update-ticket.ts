import { Injectable } from "@nestjs/common";
import { TicketRepository } from "../repositories/ticket-repository";
import { Ticket } from "../entity/Ticket";
import { FindEventById } from "@application/event/use-cases/find-event-by-id";
import { FindEstablishmentByUserUid } from "@application/establishment/use-cases/find-many-by-user";
import { UnauthorizedException } from "@nestjs/common";

interface TicketRequest {
    price: number;
    id: string;
    quantity_available: number;
    eventId: string;
    useruid: string;
}

interface TicketResponse {
    ticket: Ticket
}

@Injectable()
export class UpdateTicket {

    constructor(
        private ticketRepository: TicketRepository,
        private findEvent: FindEventById,
        private findEstablishment: FindEstablishmentByUserUid
    ) { }

    async execute(request: TicketRequest): Promise<TicketResponse> {
        const { price, quantity_available, eventId, id, useruid } = request

        const ticket = await this.ticketRepository.findById(id)

        const { event } = await this.findEvent.execute({ id: eventId })
        const { establishment } = await this.findEstablishment.execute({ useruid })

        if (event.establishmentId !== establishment.id) {
            throw new UnauthorizedException("Acesso negado!")
        }

        const updatedTicket = new Ticket({
            description: ticket.description,
            eventId: ticket.eventId,
            createdAt: ticket.createdAt,
            price,
            quantity_available
        }, ticket.id)

        await this.ticketRepository.save(updatedTicket)

        return { ticket: updatedTicket }
    }
}