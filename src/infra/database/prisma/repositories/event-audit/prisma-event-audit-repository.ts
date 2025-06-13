import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { AuditEntity } from "@application/audit-entity/entity/EntityAudit";
import { PrismaAuditMapper } from "../../mappers/audit/prisma-audit-mapper";
import { EventAuditRepository } from "@application/audit-entity/repositories/event-audit-repository";

@Injectable()
export class PrismaEventAuditRepository implements EventAuditRepository {

    constructor(
        private prisma: PrismaService
    ) { }

    async create(entity: AuditEntity): Promise<void> {
        const raw = PrismaAuditMapper.toPrisma(entity)

        await this.prisma.eventAudit.create({
            data: raw
        })
    }

    async findByEntityId(entityId: string): Promise<AuditEntity[]> {
        const audits = await this.prisma.eventAudit.findMany({
            where: {
                entityId
            }
        })

        return audits.map(PrismaAuditMapper.toDomain)
    }

}
