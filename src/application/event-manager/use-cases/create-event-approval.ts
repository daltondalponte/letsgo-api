import { Injectable } from "@nestjs/common";
import { EventRepository } from "@application/event/repositories/event-repository";
import { EventApprovalsStatus } from "@prisma/client";

export interface EventApprovalRequest {
    eventId: string;
    useruid: string;
    status: EventApprovalsStatus;
}


@Injectable()
export class CreateEventApproval {

    constructor(
        private eventRepository: EventRepository

    ) { }

    async execute(request: EventApprovalRequest): Promise<void> {

        const { eventId, useruid, status } = request

        await this.eventRepository.createApproval(
            {
                eventId,
                useruid,
                status
            }
        )

    }
}