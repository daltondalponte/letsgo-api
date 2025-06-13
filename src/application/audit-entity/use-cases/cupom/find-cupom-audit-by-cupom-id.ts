import { Injectable } from "@nestjs/common";
import { AuditEntity } from "../../entity/EntityAudit";
import { CupomAuditRepository } from "@application/audit-entity/repositories/cupom-audit-repository";

interface CupomAuditRequest {
    entityId: string;
}

interface CupomAuditResponse {
    cuponsAudits: AuditEntity[]
}

@Injectable()
export class FindCupomAudit {

    constructor(
        private auditEntityRepository: CupomAuditRepository
    ) { }

    async execute(request: CupomAuditRequest): Promise<CupomAuditResponse> {

        const {
            entityId
        } = request

        const cuponsAudits = await this.auditEntityRepository.findByEntityId(entityId)

        return { cuponsAudits }
    }
}