import { Injectable } from "@nestjs/common";
import { TicketTaker } from "../entity/TicketTaker";
import { TicketTakerRepository } from "../repository/ticket-taker-repository";

interface FindByIdRequest {
    id: string;
}

interface FindByIdResponse {
    ticketTaker: TicketTaker
}

@Injectable()
export class FindTicketTakerByUserTakerId {

    constructor(
        private ticketTakerRepository: TicketTakerRepository
    ) { }

    async execute(request: FindByIdRequest): Promise<FindByIdResponse> {
        const { id } = request

        const ticketTaker = await this.ticketTakerRepository.findByUserTakerId(id)

        return { ticketTaker }
    }
}