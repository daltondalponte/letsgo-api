


import { Injectable } from "@nestjs/common";
import { TicketRepository } from "../repositories/ticket-repository";
import { Ticket } from "../entity/Ticket";


interface TicketRequest {
    tickets: {
        description: string;
        price: number;
        quantity_available: number;
    }[]
    eventId: string;
}


@Injectable()
export class CreateManyTickets {

    constructor(
        private ticketRepository: TicketRepository
    ) { }

    async execute(request: TicketRequest): Promise<void> {
        const { eventId, tickets } = request

        const manyTickets = tickets.map(t => {
            return new Ticket({
                description: t.description,
                eventId,
                price: t.price,
                quantity_available: t.quantity_available
            })
        })

        await this.ticketRepository.createCreateMany(manyTickets)
    }
}
