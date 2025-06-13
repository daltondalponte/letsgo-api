import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { AuditEntity } from "@application/audit-entity/entity/EntityAudit";
import { PrismaAuditMapper } from "../../mappers/audit/prisma-audit-mapper";
import { CupomAuditRepository } from "@application/audit-entity/repositories/cupom-audit-repository";

@Injectable()
export class PrismaCupomAuditRepository implements CupomAuditRepository {

    constructor(
        private prisma: PrismaService
    ) { }

    async create(entity: AuditEntity): Promise<void> {
        const raw = PrismaAuditMapper.toPrisma(entity)

        await this.prisma.cupomAudit.create({
            data: raw
        })
    }

    async findByEntityId(entityId: string): Promise<AuditEntity[]> {
        const audits = await this.prisma.cupomAudit.findMany({
            where: {
                entityId
            }
        })

        return audits.map(PrismaAuditMapper.toDomain)
    }

}
