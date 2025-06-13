import { Injectable } from "@nestjs/common";
import { Ticket } from "../entity/Ticket";
import { TicketRepository } from "../repositories/ticket-repository";

interface FindManyByIdRequest {
    id: string;
}

interface FindManyByIdResponse {
    ticket: Ticket
}

@Injectable()
export class FindTicketById {

    constructor(
        private ticketRepository: TicketRepository
    ) { }

    async execute(request: FindManyByIdRequest): Promise<FindManyByIdResponse> {
        const { id } = request

        const ticket = await this.ticketRepository.findById(id)

        return { ticket }
    }
}