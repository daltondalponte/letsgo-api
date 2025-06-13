import { Injectable } from "@nestjs/common";
import { TicketRepository } from "@application/ticket/repositories/ticket-repository";

interface FindAllTicketsResponse {
    tickets: any[];
}

@Injectable()
export class FindAllTickets {
    constructor(private ticketRepository: TicketRepository) {}

    async execute(): Promise<FindAllTicketsResponse> {
        const tickets = await this.ticketRepository.findAll();
        
        return {
            tickets
        };
    }
}
