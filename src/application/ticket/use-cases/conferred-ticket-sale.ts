import { Injectable } from "@nestjs/common";
import { TicketRepository } from "../repositories/ticket-repository";
import { Ticket } from "../entity/Ticket";

interface TicketRequest {
    id: string;
}

@Injectable()
export class ConferredTicketPurchase {

    constructor(
        private ticketRepository: TicketRepository
    ) { }

    async execute(request: TicketRequest): Promise<void> {
        const { id } = request

        await this.ticketRepository.savePurchase(id)


    }
}