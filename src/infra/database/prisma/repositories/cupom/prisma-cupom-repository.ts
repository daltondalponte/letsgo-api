import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { CupomRepository } from "@application/cupom/repositories/cupom-repository";
import { Cupom } from "@application/cupom/entity/Cupom";
import { PrismaCupomMapper } from "../../mappers/cupom/prisma-cupom-mapper";

@Injectable()
export class PrismaCupomRepository implements CupomRepository {

    constructor(
        private prisma: PrismaService
    ) { }


    async dettachCupomTicket(cupomId: string, ticketId: string): Promise<void> {
        await this.prisma.ticketCupons.delete({
            where: {
                ticketId_cupomId: {
                    ticketId,
                    cupomId
                }
            }
        })
    }

    async attachCupomTicket(cupomId: string, ticketId: string): Promise<void> {
        await this.prisma.ticketCupons.create({
            data: {
                cupomId,
                ticketId
            }
        })
    }

    async create(cupom: Cupom): Promise<void> {
        const rawCupom = PrismaCupomMapper.toPrisma(cupom)

        await this.prisma.cupom.create({
            data: rawCupom
        })
    }

    async findByTicketId(ticketId: string): Promise<Cupom[]> {

        const cupons = await this.prisma.cupom.findMany({
            where: {
                TicketCupons: {
                    some: {
                        ticketId
                    }
                }
            }
        })

        return cupons.map(PrismaCupomMapper.toDomain)
    }

    async findByTicketIdAndCode(ticketId: string, code: string, eventId: string): Promise<Cupom> {

        const cupom = await this.prisma.cupom.findFirst({
            where: {
                code,
                eventId
            },
            include: {
                TicketCupons: true
            }
        })

        if (!cupom) throw new BadRequestException("Código inválido")

        const finded = cupom.TicketCupons.find(c => c.ticketId === ticketId)

        if (!finded || new Date(new Date().toISOString().substring(0, 10)) > new Date(cupom.expiresAt) || cupom.quantity_available <= 0) throw new BadRequestException("Código inválido")

        return PrismaCupomMapper.toDomain(cupom)

    }

    async findManyByEventId(eventId?: string): Promise<Cupom[]> {

        const whereClause = eventId ? { eventId } : { eventId: null };

        const cupons = await this.prisma.cupom.findMany({
            where: whereClause
        })

        return cupons.map(PrismaCupomMapper.toDomain)
    }

    async findById(id: string): Promise<Cupom> {
        const cupom = await this.prisma.cupom.findUnique({
            where: {
                id
            }
        })

        return PrismaCupomMapper.toDomain(cupom)
    }

    async save(cupom: Cupom): Promise<void> {
        const rawCupom = PrismaCupomMapper.toPrisma(cupom)

        await this.prisma.cupom.update({
            where: {
                id: rawCupom.id
            },
            data: rawCupom
        })
    }

}
