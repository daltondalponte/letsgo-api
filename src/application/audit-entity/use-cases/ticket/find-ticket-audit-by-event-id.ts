import { Injectable } from "@nestjs/common";
import { AuditEntity } from "../../entity/EntityAudit";
import { TicketAuditRepository } from "@application/audit-entity/repositories/ticket-audit-repository";

interface TicketAuditRequest {
    entityId: string;
}

interface TicketAuditResponse {
    ticketAudits: AuditEntity[]
}

@Injectable()
export class FindTicketAudit {

    constructor(
        private auditEntityRepository: TicketAuditRepository
    ) { }

    async execute(request: TicketAuditRequest): Promise<TicketAuditResponse> {

        const {
            entityId
        } = request

        const ticketAudits = await this.auditEntityRepository.findByEntityId(entityId)

        return { ticketAudits }
    }
}