import { Injectable } from "@nestjs/common";
import { TicketRepository } from "../repositories/ticket-repository";

interface FindManyByIdRequest {
    id: string;
}

interface FindManyByIdResponse {
    ticket: any
}

@Injectable()
export class FindTicketByIdWithDetails {

    constructor(
        private ticketRepository: TicketRepository
    ) { }

    async execute(request: FindManyByIdRequest): Promise<FindManyByIdResponse> {
        const { id } = request

        const ticket = await this.ticketRepository.findByIdIncludeOwnerEventStripeDetail(id)

        return { ticket }
    }
}