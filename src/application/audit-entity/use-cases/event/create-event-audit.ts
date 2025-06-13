import { Injectable } from "@nestjs/common";


import { AuditEntity, AuditEntityProps } from "../../entity/EntityAudit";
import { EventAuditRepository } from "../../repositories/event-audit-repository";

interface EventAuditRequest extends Omit<AuditEntityProps, "createdAt" | "updatedAt"> { }

interface EventAuditResponse {
    eventAudit: AuditEntity
}

@Injectable()
export class CreateEventAudit {

    constructor(
        private auditEntityRepository: EventAuditRepository
    ) { }

    async execute(request: EventAuditRequest): Promise<EventAuditResponse> {
        const {
            details,
            modificationType,
            useruid,
            entityId
        } = request

        const eventAudit = new AuditEntity({
            details,
            modificationType,
            useruid,
            entityId
        })

        await this.auditEntityRepository.create(eventAudit)

        return { eventAudit }
    }
}