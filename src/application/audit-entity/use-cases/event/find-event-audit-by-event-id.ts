import { Injectable } from "@nestjs/common";
import { AuditEntity } from "../../entity/EntityAudit";
import { EventAuditRepository } from "../../repositories/event-audit-repository";

interface EventAuditRequest {
    entityId: string;
}

interface EventAuditResponse {
    eventAudits: AuditEntity[]
}

@Injectable()
export class FindEventAudit {

    constructor(
        private auditEntityRepository: EventAuditRepository
    ) { }

    async execute(request: EventAuditRequest): Promise<EventAuditResponse> {

        const {
            entityId
        } = request

        const eventAudits = await this.auditEntityRepository.findByEntityId(entityId)

        return { eventAudits }
    }
}