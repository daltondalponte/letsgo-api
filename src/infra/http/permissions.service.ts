import { PrismaService } from '@infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PermissionsService {

    constructor(
        private readonly prisma: PrismaService
    ) { }

    async canInsertTickets(eventId: string, userId: string): Promise<boolean> {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId }
        });

        if (!event) {
            return false;
        }

        console.log('=== DEBUG canInsertTickets ===');
        console.log('Event:', event);
        console.log('Event.establishmentId:', event.establishmentId);
        console.log('UserId:', userId);

        // Se o usuário é o dono do evento, permitir
        if (event.useruid === userId) {
            console.log('Usuário é dono do evento - PERMITIDO');
            return true;
        }

        // Se o usuário é o owner do estabelecimento, permitir
        if (event.establishmentId) {
            console.log('Buscando establishment com ID:', event.establishmentId);
            const establishment = await this.prisma.establishment.findUnique({
                where: { id: event.establishmentId }
            });
            console.log('Establishment encontrado:', establishment);
            
            if (establishment && establishment.userOwnerUid === userId) {
                console.log('Usuário é owner do estabelecimento - PERMITIDO');
                return true;
            }
        }

        // Recepcionistas não podem alterar dados de eventos (só usam app mobile)
        console.log('Usuário não tem permissão - NEGADO');
        return false;
    }

    async canUpdateTickets(eventId: string, userId: string): Promise<boolean> {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId }
        });

        if (!event) {
            return false;
        }

        // Se o usuário é o dono do evento, permitir
        if (event.useruid === userId) {
            return true;
        }

        // Se o usuário é o owner do estabelecimento, permitir
        const establishment = await this.prisma.establishment.findUnique({
            where: { id: event.establishmentId }
        });
        if (establishment && establishment.userOwnerUid === userId) {
            return true;
        }

        // Recepcionistas não podem alterar dados de eventos (só usam app mobile)
        return false;
    }

    async canDeleteTickets(ticketId: string, userId: string): Promise<boolean> {
        // Primeiro, buscar o ticket para obter o eventId
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: ticketId },
            select: { eventId: true }
        });

        if (!ticket) return false;

        // Verificar se o usuário é o dono do evento
        const event = await this.prisma.event.findUnique({
            where: { id: ticket.eventId }
        });

        if (!event) return false;

        // Se o usuário é o dono do evento, permitir
        if (event.useruid === userId) {
            return true;
        }

        // Se o usuário é o owner do estabelecimento, permitir
        const establishment = await this.prisma.establishment.findUnique({
            where: { id: event.establishmentId }
        });
        if (establishment && establishment.userOwnerUid === userId) {
            return true;
        }

        // Recepcionistas não podem alterar dados de eventos (só usam app mobile)
        return false;
    }

    async canInsertCupons(eventId: string | null, userId: string): Promise<boolean> {
        // Se não há eventId, é um cupom global - não permitir (deve ser tratado no guard)
        if (!eventId) {
            return false;
        }

        const event = await this.prisma.event.findUnique({
            where: { id: eventId }
        });

        if (!event) {
            return false;
        }

        // Se o usuário é o dono do evento, permitir
        if (event.useruid === userId) {
            return true;
        }

        // Se o usuário é o owner do estabelecimento, permitir
        const establishment = await this.prisma.establishment.findUnique({
            where: { id: event.establishmentId }
        });
        if (establishment && establishment.userOwnerUid === userId) {
            return true;
        }

        // Recepcionistas não podem alterar dados de eventos (só usam app mobile)
        return false;
    }

    async isManagerOfEvent(eventId: string, userId: string): Promise<boolean> {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId }
        });

        if (!event) {
            return false;
        }

        // Se o usuário é o dono do evento, é considerado manager
        if (event.useruid === userId) {
            return true;
        }

        // Se o usuário é o owner do estabelecimento, é considerado manager
        const establishment = await this.prisma.establishment.findUnique({
            where: { id: event.establishmentId }
        });
        if (establishment && establishment.userOwnerUid === userId) {
            return true;
        }

        // Recepcionistas não são considerados managers para alteração de dados
        return false;
    }

    async isOwnerOfEstablishment(establishmentId: string, userId: string): Promise<boolean> {
        const establishment = await this.prisma.establishment.findUnique({
            where: {
                id: establishmentId
            }
        });

        return establishment.userOwnerUid === userId;
    }

    async isOwnerOfEvent(eventId: string, userId: string): Promise<boolean> {
        const event = await this.prisma.event.findUnique({
            where: {
                id: eventId
            }
        });

        return event.useruid === userId;
    }

    async canUpdateCupons(eventId: string, userId: string): Promise<boolean> {
        if (!eventId || eventId === "" || eventId === "null") {
            // Cupom global: permitir se o usuário for o criador do cupom global
            const cupom = await this.prisma.cupom.findFirst({
                where: { eventId: null, useruid: userId }
            });
            return !!cupom;
        }

        const event = await this.prisma.event.findUnique({
            where: { id: eventId }
        });

        if (!event) {
            return false;
        }

        // Se o usuário é o dono do evento, permitir
        if (event.useruid === userId) {
            return true;
        }

        // Se o usuário é o owner do estabelecimento, permitir
        const establishment = await this.prisma.establishment.findUnique({
            where: { id: event.establishmentId }
        });
        if (establishment && establishment.userOwnerUid === userId) {
            return true;
        }

        // Recepcionistas não podem alterar dados de eventos (só usam app mobile)
        return false;
    }

    // TODO OTHER PERMISSIONS REQUIRED TO MANAGER

} 