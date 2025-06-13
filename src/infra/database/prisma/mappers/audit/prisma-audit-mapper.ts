
import { AuditEntity } from "@application/audit-entity/entity/EntityAudit";

export class PrismaAuditMapper {
    static toPrisma(auditEntity: AuditEntity) {
        return {
            id: auditEntity.id,
            useruid: auditEntity.useruid,
            entityId: auditEntity.entityId,
            modificationType: auditEntity.modificationType,
            details: auditEntity.details,
            createdAt: auditEntity.createdAt,
            updatedAt: auditEntity.updatedAt
        }
    }

    static toDomain(rawAuditEntity: AuditEntity) {
        return new AuditEntity({
            useruid: rawAuditEntity.useruid,
            entityId: rawAuditEntity.entityId,
            modificationType: rawAuditEntity.modificationType,
            details: rawAuditEntity.details,
            createdAt: rawAuditEntity.createdAt,
            updatedAt: rawAuditEntity.updatedAt
        }, rawAuditEntity?.id)
    }
}