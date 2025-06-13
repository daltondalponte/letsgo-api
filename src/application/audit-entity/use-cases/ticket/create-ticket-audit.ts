import { Injectable } from "@nestjs/common";
import { AuditEntity, AuditEntityProps } from "../../entity/EntityAudit";
import { TicketAuditRepository } from "@application/audit-entity/repositories/ticket-audit-repository";

interface TicketAuditRequest extends Omit<AuditEntityProps, "createdAt" | "updatedAt"> { }

interface TicketAuditResponse {
    ticketAudit: AuditEntity
}

@Injectable()
export class CreateTicketAudit {

    constructor(
        private auditEntityRepository: TicketAuditRepository
    ) { }

    async execute(request: TicketAuditRequest): Promise<TicketAuditResponse> {
        const {
            details,
            modificationType,
            useruid,
            entityId
        } = request

        const ticketAudit = new AuditEntity({
            details,
            modificationType,
            useruid,
            entityId
        })

        await this.auditEntityRepository.create(ticketAudit)

        return { ticketAudit }
    }
}