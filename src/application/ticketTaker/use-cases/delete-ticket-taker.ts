import { Injectable } from "@nestjs/common";
import { TicketTakerRepository } from "../repository/ticket-taker-repository";

interface TicketTakerRequest {
    id: string;
}

@Injectable()
export class DeleteTicketTaker {

    constructor(
        private ticketTackerRepository: TicketTakerRepository
    ) { }

    async execute(request: TicketTakerRequest): Promise<void> {
        const { id } = request

        await this.ticketTackerRepository.delete(id)
    }
}