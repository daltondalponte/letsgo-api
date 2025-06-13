import { AuditEntity } from "../entity/EntityAudit";

export abstract class CupomAuditRepository {
    abstract create(entity: AuditEntity): Promise<void>;
    abstract findByEntityId(entityId: string): Promise<AuditEntity[] | null>;
}