import { Injectable } from "@nestjs/common";
import { Ticket } from "../entity/Ticket";
import { TicketRepository } from "../repositories/ticket-repository";

interface FindManyByEventRequest {
    eventId: string;
}

interface FindManyByEventResponse {
    tickets: any
}

@Injectable()
export class FindTicketsByEvent {

    constructor(
        private ticketRepository: TicketRepository
    ) { }

    async execute(request: FindManyByEventRequest): Promise<FindManyByEventResponse> {
        const { eventId } = request

        const { tickets } = await this.ticketRepository.findByEventId(eventId)
        
        return { tickets }
    }
}