import { Injectable } from "@nestjs/common";
import { TicketRepository } from "../repositories/ticket-repository";
import { Ticket } from "../entity/Ticket";

interface TicketRequest {
    userId: string;
}

interface TicketResponse {
    tickets: Ticket[]
}

@Injectable()
export class FindTicketPurchase {

    constructor(
        private ticketRepository: TicketRepository
    ) { }

    async execute(request: TicketRequest): Promise<TicketResponse> {
        const { userId } = request

        const tickets = await this.ticketRepository.findPurchaseUserId(userId)

        return { tickets }

    }
}