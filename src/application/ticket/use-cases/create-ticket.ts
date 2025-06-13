import { Injectable } from "@nestjs/common";
import { TicketRepository } from "../repositories/ticket-repository";
import { Ticket } from "../entity/Ticket";


interface TicketRequest {
    description: string;
    price: number;
    eventId: string;
    quantity_available: number;
    useruid: string;
}

interface TicketResponse {
    ticket: Ticket
}

@Injectable()
export class CreateTicket {

    constructor(
        private ticketRepository: TicketRepository
    ) { }

    async execute(request: TicketRequest): Promise<TicketResponse> {
        const { description, eventId, price, quantity_available, useruid } = request

        const ticket = new Ticket({
            description, eventId, price, quantity_available, useruid
        })

        await this.ticketRepository.create(ticket)

        return { ticket }
    }
}