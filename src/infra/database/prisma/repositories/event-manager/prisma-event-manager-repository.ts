import { Injectable, BadRequestException } from "@nestjs/common";
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
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Injectable()
export class PrismaEventManagerRepository implements EventManagerRepository {

    constructor(
        private prisma: PrismaService
    ) { }

    // Função auxiliar para sincronizar o campo ticketTakers do evento
    private async syncEventTicketTakers(eventId: string) {
        // Buscar todos os EventReceptionists do evento
        const managers = await this.prisma.eventsReceptionist.findMany({
            where: { eventId },
            include: { user: true }
        });
        
        // Montar lista de emails dos usuários vinculados
        const ticketTakers = managers.map(m => m.user.email);
        
        // Atualizar o campo ticketTakers do evento
        await this.prisma.event.update({
            where: { id: eventId },
            data: { ticketTakers }
        });
    }

    async findByEventId(eventId: string): Promise<{ eventManager: EventManager, user: User, }[] | null> {
        const managers = await this.prisma.eventsReceptionist.findMany({
            where: {
                eventId: eventId
            },
            include: {
                user: true
            }
        });

        return managers.map(e => ({
            eventManager: PrismaEventManagerMapper.toDomain(e),
            user: e.user as any
        }));
    }

    async create(eventManager: EventManager): Promise<void> {
        await this.prisma.eventsReceptionist.create({
            data: {
                id: eventManager.id,
                useruid: eventManager.useruid,
                eventId: eventManager.eventId,
                recursos: eventManager.recursos
            }
        });
    }

    async findByEventAndUser(eventId: string, useruid: string): Promise<EventManager | null> {
        const eventsManager = await this.prisma.eventsReceptionist.findMany({
            where: {
                eventId: eventId,
                useruid: useruid
            },
            include: {
                user: true
            }
        });

        if (eventsManager.length === 0) {
            return null;
        }

        return PrismaEventManagerMapper.toDomain(eventsManager[0]);
    }

    async findByUserUid(useruid: string): Promise<{ eventManager: EventManager, event: Event, establishment: Establishment }[] | null> {
        const eventsManager = await this.prisma.eventsReceptionist.findMany({
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

        return eventsManager.map(e => ({
            eventManager: PrismaEventManagerMapper.toDomain(e),
            event: e.event as any,
            establishment: e.event.establishment as any
        }));
    }

    async findById(id: string): Promise<EventManager | null> {
        const eventManager = await this.prisma.eventsReceptionist.findUnique({
            where: {
                id: id
            },
            include: {
                user: true
            }
        });

        if (!eventManager) {
            return null;
        }

        return PrismaEventManagerMapper.toDomain(eventManager);
    }

    async save(eventManager: EventManager): Promise<void> {
        await this.prisma.eventsReceptionist.update({
            where: {
                id: eventManager.id
            },
            data: {
                recursos: eventManager.recursos
            }
        });
    }

    async delete(eventId: string, useruid: string): Promise<void> {
        await this.prisma.eventsReceptionist.deleteMany({
            where: {
                eventId: eventId,
                useruid: useruid
            }
        });
        // Sincronizar ticketTakers após remover vínculo
        await this.syncEventTicketTakers(eventId);
    }

}