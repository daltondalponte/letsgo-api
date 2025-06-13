import { PrismaService } from '@infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PermissionsService {

    constructor(
        private readonly prisma: PrismaService
    ) { }

    async canInsertTickets(eventId: string, userId: string): Promise<boolean> {

        const canManage = await this.prisma.eventsManager.findUnique({
            where: {
                useruid: userId,
                useruid_eventId: {
                    useruid: userId,
                    eventId: eventId
                }
            }
        })

        if (!canManage) return false

        return canManage.recursos.includes("TICKETINSERT")

    }

    async canUpdateTickets(eventId: string, userId: string): Promise<boolean> {

        const canManage = await this.prisma.eventsManager.findUnique({
            where: {
                useruid: userId,
                useruid_eventId: {
                    useruid: userId,
                    eventId: eventId
                }
            }
        })

        if (!canManage) return false

        return canManage.recursos.includes("TICKETUPDATE")

    }

    async canInsertCupons(eventId: string, userId: string): Promise<boolean> {

        const canManage = await this.prisma.eventsManager.findUnique({
            where: {
                useruid: userId,
                useruid_eventId: {
                    useruid: userId,
                    eventId: eventId
                }
            }
        })

        if (!canManage) return false

        return canManage.recursos.includes("CUPOMINSERT")

    }

    async isManagerOfEvent(eventId: string, userId: string): Promise<boolean> {

        const event = await this.prisma.eventsManager.findUnique({
            where: {
                useruid_eventId: {
                    useruid: userId,
                    eventId
                }
            }
        })

        return !!event
    }


    async isOwnerOfEstablishment(establishmentId: string, userId: string): Promise<boolean> {

        const establishment = await this.prisma.establishment.findUnique({
            where: {
                id: establishmentId
            }
        })

        return establishment.userOwnerUid === userId
    }

    async isOwnerOfEvent(eventId: string, userId: string): Promise<boolean> {

        const event = await this.prisma.event.findUnique({
            where: {
                id: eventId
            }
        })

        return event.useruid === userId
    }

    async canUpdateCupons(eventId: string, userId: string): Promise<boolean> {

        const canManage = await this.prisma.eventsManager.findUnique({
            where: {
                useruid: userId,
                useruid_eventId: {
                    useruid: userId,
                    eventId: eventId
                }
            }
        })

        if (!canManage) return false

        return canManage.recursos.includes("CUPOMUPDATE")

    }

    // TODO OTHER PERMISSIONS REQUIRED TO MANAGER

}
