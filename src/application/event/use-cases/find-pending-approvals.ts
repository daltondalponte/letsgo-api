import { Injectable } from "@nestjs/common";
import { EventRepository } from "../repositories/event-repository";

interface PendingApprovalRequest {
    establishmentId: string;
}

interface PendingApprovalResponse {
    events: Array<{
        id: string;
        name: string;
        description: string;
        dateTimestamp: string;
        address: string;
        promoter: {
            id: string;
            name: string;
            email: string;
        };
        establishment: {
            id: string;
            name: string;
        };
        status: "PENDING" | "APPROVED" | "REJECT";
        createdAt: string;
    }>;
}

@Injectable()
export class FindPendingApprovals {

    constructor(
        private eventRepository: EventRepository
    ) { }

    async execute(request: PendingApprovalRequest): Promise<PendingApprovalResponse> {
        const { establishmentId } = request;

        const events = await this.eventRepository.findPendingApprovals(establishmentId);

        return { events };
    }
} 