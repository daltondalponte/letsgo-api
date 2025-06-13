import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { EventRepository } from "@application/event/repositories/event-repository";
import { Event } from "@application/event/entity/Event";
import { PrismaEventMapper } from "../../mappers/event/prisma-event-mapper";
import { EventApprovalRequest } from "@application/event-manager/use-cases/create-event-approval";

@Injectable()
export class PrismaEventRepository implements EventRepository {

    constructor(
        private prisma: PrismaService
    ) { }


    async createApproval({ eventId, useruid, status }: EventApprovalRequest): Promise<void> {
        await this.prisma.eventApprovals.create({
            data: {
                useruid,
                eventId,
                status
            }
        })
    }

    async create(event: Event): Promise<void> {
        try {
            const rawEvent = PrismaEventMapper.toPrisma(event)

            console.log("raw", rawEvent);

            //if (rawEvent.establishmentId) delete rawEvent.useruid

            await this.prisma.event.create({
                data: {
                    ...rawEvent,
                    useruid: rawEvent.useruid
                }
            })
        } catch (error) {
            console.error(error);
            throw new BadRequestException("Ocorreu um erro")
        }
    }

    async findManyByUserUidOrEstablishmentId(useruid?: string, establishmentId?: string): Promise<any[]> {

        const events = await this.prisma.event.findMany({
            where: {
                establishmentId,
                AND: [
                    {
                        dateTimestamp: {
                            gte: new Date()
                        }
                    }
                ]
            },
            include: {
                EventApprovals: true,
                establishment: true
            }
        })

        return events.map(e => ({
            ...PrismaEventMapper.toDomain(e),
            eventApprovals: e?.EventApprovals,
            establishment: e.establishment
        }))
    }

    async findAll(): Promise<Event[]> {
        const events = await this.prisma.event.findMany({
            include: {
                establishment: true,
                Ticket: true, // Corrigido de 'tickets' para 'Ticket'
                user: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return events.map(PrismaEventMapper.toDomain);
    }

    async findByUserUid(uid: string): Promise<Event[]> {
        const events = await this.prisma.event.findMany({
            where: {
                useruid: uid // Corrigido de 'userId' para 'useruid'
            },
            include: {
                Ticket: true, // Corrigido de 'tickets' para 'Ticket'
            }
        });

        return events.map(PrismaEventMapper.toDomain);
    }

    async findById(id: string): Promise<Event> {
        const rawEvent = await this.prisma.event.findUnique({
            where: { id }
        })

        return PrismaEventMapper.toDomain(rawEvent)
    }

    async save(event: Event): Promise<void> {
        const rawEvent = PrismaEventMapper.toPrisma(event)
        delete rawEvent.id

        await this.prisma.event.update({
            where: {
                id: event.id
            },
            data: rawEvent
        })

    }

}
