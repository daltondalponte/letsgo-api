import { Injectable } from "@nestjs/common";
import { TicketTaker } from "../entity/TicketTaker";
import { TicketTakerRepository } from "../repository/ticket-taker-repository";
import { User } from "@application/user/entity/User";

interface FindManyByEventRequest {
    userOwnerUid: string;
}

interface FindManyByEventResponse {
    users: User[]
}

@Injectable()
export class FindTicketsTakerByOwner {

    constructor(
        private ticketTakerRepository: TicketTakerRepository
    ) { }

    async execute(request: FindManyByEventRequest): Promise<FindManyByEventResponse> {
        const { userOwnerUid } = request

        const users = await this.ticketTakerRepository.findByOwnerId(userOwnerUid)

        return { users }
    }
}