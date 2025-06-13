import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { AuditEntity } from "@application/audit-entity/entity/EntityAudit";
import { PrismaAuditMapper } from "../../mappers/audit/prisma-audit-mapper";
import { TicketAuditRepository } from "@application/audit-entity/repositories/ticket-audit-repository";

@Injectable()
export class PrismaTicketAuditRepository implements TicketAuditRepository {

    constructor(
        private prisma: PrismaService
    ) { }

    async create(entity: AuditEntity): Promise<void> {
        const raw = PrismaAuditMapper.toPrisma(entity)

        await this.prisma.ticketAudit.create({
            data: raw
        })
    }

    async findByEntityId(entityId: string): Promise<AuditEntity[]> {
        const audits = await this.prisma.ticketAudit.findMany({
            where: {
                entityId
            }
        })

        return audits.map(PrismaAuditMapper.toDomain)
    }

}
