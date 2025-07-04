import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { EventManagerRepository } from "@application/event-manager/repositories/event-manager-repository";
import { EventManager } from "@application/event-manager/entity/EventManager";
import { PrismaEventManagerMapper } from "../../mappers/event-manager/prisma-event-manager-mapper";
import { Event } from "@application/event/entity/Event";
import { Establishment } from "@application/establishment/entity/Establishment";
import { PrismaEventMapper } from "../../mappers/event/prisma-event-mapper";
import { PrismaEstablishmentMapper } from "../../mappers/establishment/prisma-establishment-mapper";
import { User } from "@application/user/entity/User";
import { PrismaUserMapper } from "../../mappers/user/prisma-user-mapper";

@Injectable()
export class PrismaEventManagerRepository implements EventManagerRepository {

    constructor(
        private prisma: PrismaService
    ) { }

    async create(eventManager: EventManager): Promise<void> {
        const raw = PrismaEventManagerMapper.toPrisma(eventManager)
        await this.prisma.eventsManager.create({
            data: raw
        })
    }

    async findByEventId(eventId: string): Promise<{ eventManager: EventManager; user: User; }[]> {
        const eventsManager = await this.prisma.eventsManager.findMany({
            where: {
                eventId
            },
            include: {
                user: true
            }
        })

        return eventsManager.map(e => {
            return {
                eventManager: PrismaEventManagerMapper.toDomain({
                    createdAt: e.createdAt,
                    eventId: e.eventId,
                    id: e.id,
                    recursos: e.recursos,
                    updatedAt: e.updatedAt,
                    useruid: e.useruid
                }),
                user: PrismaUserMapper.toDomain(e.user as any)
            }
        })
    }

    async findByUserUid(useruid?: string): Promise<{ eventManager: EventManager, event: Event, establishment: Establishment }[]> {
        const eventsManager = await this.prisma.eventsManager.findMany({
            where: {
                AND: [
                    {
                        useruid
                    },
                    {
                        event: {
                            AND: [
                                {
                                    dateTimestamp: {
                                        gte: new Date()
                                    }
                                }
                            ]
                        }
                    }
                ]
            },
            include: {
                event: {
                    select: {
                        address: true,
                        createdAt: true,
                        updatedAt: true,
                        dateTimestamp: true,
                        description: true,
                        establishment: true,
                        name: true,
                        photos: true,
                        coordinates_event: true,
                        establishmentId: true,
                        id: true,
                        listNames: true,
                        isActive: true,
                        useruid: true
                    }
                }
            }

        })

        return eventsManager.map(e => {
            return {
                eventManager: PrismaEventManagerMapper.toDomain({
                    createdAt: e.createdAt,
                    eventId: e.eventId,
                    id: e.id,
                    recursos: e.recursos,
                    updatedAt: e.updatedAt,
                    useruid: e.useruid
                }),
                event: PrismaEventMapper.toDomain(e.event as any),
                establishment: PrismaEstablishmentMapper.toDomain(e.event.establishment)
            }
        })
    }

    async findById(id: string): Promise<EventManager> {
        const eventManager = await this.prisma.eventsManager.findUnique({
            where: {
                id
            }
        });

        if (!eventManager) {
            return null;
        }

        return PrismaEventManagerMapper.toDomain(eventManager);
    }

    async save(eventManager: EventManager): Promise<void> {
        const raw = PrismaEventManagerMapper.toPrisma(eventManager)

        await this.prisma.eventsManager.update({
            where: {
                id: raw.id,
            },
            data: raw
        })
    }

    async delete(eventId: string, useruid: string): Promise<void> {
        await this.prisma.eventsManager.delete({
            where: {
                useruid_eventId: {
                    eventId,
                    useruid
                }
            }
        })
    }

}