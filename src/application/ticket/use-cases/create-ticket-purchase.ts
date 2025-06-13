import { Injectable } from "@nestjs/common";
import { TicketRepository } from "../repositories/ticket-repository";

interface TicketRequest {
    paymentId: string;
    ticketId: string;
    userId: string;
    cupomId?: string
}

@Injectable()
export class CreateTicketPurchase {

    constructor(
        private ticketRepository: TicketRepository
    ) { }

    async execute(request: TicketRequest): Promise<string> {
        const { paymentId, ticketId, userId, cupomId } = request

        const id = await this.ticketRepository.createPurchase(ticketId, userId, paymentId, cupomId)
        return id

    }
}