import { Injectable } from "@nestjs/common";
import { PrismaService } from "@infra/database/prisma/prisma.service";
import { EventManagerRepository } from "@application/event-manager/repositories/event-manager-repository";
import { EventManager } from "@application/event-manager/entity/EventManager";
import { PrismaEventManagerMapper } from "@infra/database/prisma/mappers/event-manager/prisma-event-manager-mapper";
import { Event } from "@application/event/entity/Event";
import { Establishment } from "@application/establishment/entity/Establishment";
import { User } from "@application/user/entity/User";

@Injectable()
export class PrismaEventManagerRepository implements EventManagerRepository {
    constructor(private prisma: PrismaService) { }

    async create(eventManager: EventManager): Promise<void> {
        const rawEventManager = PrismaEventManagerMapper.toPrisma(eventManager);

        await this.prisma.eventsReceptionist.create({
            data: rawEventManager
        });
    }

    async findByEventId(eventId: string): Promise<EventManager[]> {
        const eventManagers = await this.prisma.eventsReceptionist.findMany({
            where: {
                eventId: eventId
            },
            include: {
                user: true,
                event: true
            }
        });

        return eventManagers.map(PrismaEventManagerMapper.toDomain);
    }

    async findById(id: string): Promise<EventManager | null> {
        const eventManager = await this.prisma.eventsReceptionist.findUnique({
            where: {
                id: id
            },
            include: {
                user: true,
                event: true
            }
        });

        if (!eventManager) {
            return null;
        }

        return PrismaEventManagerMapper.toDomain(eventManager);
    }

    async delete(eventId: string, useruid: string): Promise<void> {
        await this.prisma.eventsReceptionist.deleteMany({
            where: {
                eventId: eventId,
                useruid: useruid
            }
        });
    }

    async save(eventManager: EventManager): Promise<void> {
        const updateData: any = {};

        if (eventManager.recursos !== undefined) {
            updateData.recursos = eventManager.recursos;
        }

        if (Object.keys(updateData).length > 0) {
            await this.prisma.eventsReceptionist.update({
                where: {
                    id: eventManager.id
                },
                data: updateData
            });
        }
    }

    async findByUserUid(useruid: string): Promise<{ eventManager: EventManager, event: Event, establishment: Establishment }[] | null> {
        const eventManagers = await this.prisma.eventsReceptionist.findMany({
            where: {
                useruid: useruid
            },
            include: {
                user: true,
                event: {
                    include: {
                        establishment: true
                    }
                }
            }
        });

        return eventManagers.map(e => ({
            eventManager: PrismaEventManagerMapper.toDomain(e),
            event: e.event as any,
            establishment: e.event.establishment as any
        }));
    }

    async findByUserId(userId: string): Promise<EventManager[]> {
        const eventManagers = await this.prisma.eventsReceptionist.findMany({
            where: {
                useruid: userId
            },
            include: {
                user: true,
                event: true
            }
        });

        return eventManagers.map(PrismaEventManagerMapper.toDomain);
    }

    async findByEventIdAndUserId(eventId: string, userId: string): Promise<EventManager | null> {
        const eventManager = await this.prisma.eventsReceptionist.findUnique({
            where: {
                useruid_eventId: {
                    useruid: userId,
                    eventId: eventId
                }
            },
            include: {
                user: true,
                event: true
            }
        });

        if (!eventManager) {
            return null;
        }

        return PrismaEventManagerMapper.toDomain(eventManager);
    }
}