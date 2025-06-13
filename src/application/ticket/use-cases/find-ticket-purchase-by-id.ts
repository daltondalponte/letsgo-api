import { Injectable } from "@nestjs/common";
import { TicketRepository } from "../repositories/ticket-repository";
import { Ticket } from "../entity/Ticket";

interface TicketRequest {
    id: string;
}

interface TicketResponse {
    ticket: any
}

@Injectable()
export class FindTicketPurchasebyId {

    constructor(
        private ticketRepository: TicketRepository
    ) { }

    async execute(request: TicketRequest): Promise<TicketResponse> {
        const { id } = request

        const ticket = await this.ticketRepository.findPurchaseById(id)

        return { ticket }

    }
}