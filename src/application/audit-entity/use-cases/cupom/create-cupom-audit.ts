import { Injectable } from "@nestjs/common";


import { AuditEntity, AuditEntityProps } from "../../entity/EntityAudit";
import { CupomAuditRepository } from "@application/audit-entity/repositories/cupom-audit-repository";

interface CupomAuditRequest extends Omit<AuditEntityProps, "createdAt" | "updatedAt"> { }

interface CupomAuditResponse {
    cupomAudit: AuditEntity
}

@Injectable()
export class CreateCupomAudit {

    constructor(
        private auditEntityRepository: CupomAuditRepository
    ) { }

    async execute(request: CupomAuditRequest): Promise<CupomAuditResponse> {
        const {
            details,
            modificationType,
            useruid,
            entityId
        } = request

        const cupomAudit = new AuditEntity({
            details,
            modificationType,
            useruid,
            entityId
        })

        await this.auditEntityRepository.create(cupomAudit)

        return { cupomAudit }
    }
}