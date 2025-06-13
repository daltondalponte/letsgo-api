import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { TicketTakerRepository } from "@application/ticketTaker/repository/ticket-taker-repository";
import { TicketTaker } from "@application/ticketTaker/entity/TicketTaker";
import { PrismaTicketTackerMapper } from "../../mappers/ticket-taker/prisma-ticket-taker-mapper";
import { User } from "@application/user/entity/User";
import { PrismaUserMapper } from "../../mappers/user/prisma-user-mapper";

@Injectable()
export class PrismaTicketTakerRepository implements TicketTakerRepository {

    constructor(
        private prisma: PrismaService
    ) { }


    async create(ticketTaker: TicketTaker): Promise<void> {
        const rawTickerTaker = PrismaTicketTackerMapper.toPrisma(ticketTaker)

        await this.prisma.ticketTaker.create({
            data: rawTickerTaker
        })
    }

    async findByOwnerId(userOwnerUid: string): Promise<User[]> {
        const ticketTakers = await this.prisma.ticketTaker.findMany({
            where: {
                userOwnerUid
            }
        })
        const users = []
        for await (const taker of ticketTakers) {
            const user = await this.prisma.user.findUnique({
                where: {
                    uid: taker.userTicketTakerUid
                }
            })

            if (user)
                users.push(user)
        }

        return users.map(PrismaUserMapper.toDomain)
    }

    async findById(id: string): Promise<TicketTaker> {
        const ticketTaker = await this.prisma.ticketTaker.findUnique({
            where: {
                userTicketTakerUid: id
            }
        })

        if (!ticketTaker) {
            throw new BadRequestException("Não encontrado")
        }
        return PrismaTicketTackerMapper.toDomain(ticketTaker)
    }

    async delete(id: string): Promise<void> {
        await this.prisma.ticketTaker.delete({
            where: {
                id
            }
        })
    }

    async findByUserTakerId(id: string): Promise<TicketTaker> {
        const ticketTaker = await this.prisma.ticketTaker.findUnique({
            where: {
                userTicketTakerUid: id
            }
        })
        if (!ticketTaker) {
            throw new BadRequestException("Não encontrado")
        }
        return PrismaTicketTackerMapper.toDomain(ticketTaker)
    }

    userTicketTakerUid(userTicketTakerUid: string): Promise<TicketTaker[]> {
        throw new Error("Method not implemented.");
    }

    save(Ticket: TicketTaker): Promise<TicketTaker> {
        throw new Error("Method not implemented.");
    }





}
