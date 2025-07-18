import { PrismaService } from '@infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PermissionsService {

    constructor(
        private readonly prisma: PrismaService
    ) { }

    // Verificar se o owner pode gerenciar eventos de promoters
    async canOwnerManagePromoterEvent(eventId: string, userId: string): Promise<boolean> {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: { user: true }
        });

        if (!event) {
            return false;
        }

        // Se o usuário não é o dono do evento, verificar se é owner do estabelecimento
        if (event.useruid !== userId && event.establishmentId) {
            const establishment = await this.prisma.establishment.findUnique({
                where: { id: event.establishmentId }
            });
            
            if (establishment && establishment.userOwnerUid === userId) {
                // Verificar se o criador do evento é um promoter
                if (event.user.type === 'PROFESSIONAL_PROMOTER') {
                    // Owner não pode gerenciar eventos de promoters
                    return false;
                }
                return true;
            }
        }

        return false;
    }

    async canInsertTickets(eventId: string, userId: string): Promise<boolean> {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: { user: true }
        });

        if (!event) {
            return false;
        }

        // Se o usuário é o dono do evento, permitir
        if (event.useruid === userId) {
            return true;
        }

        // Se o usuário é o owner do estabelecimento, verificar se pode gerenciar
        if (event.establishmentId) {
            const establishment = await this.prisma.establishment.findUnique({
                where: { id: event.establishmentId }
            });
            
            if (establishment && establishment.userOwnerUid === userId) {
                // Owner não pode alterar tickets de eventos de promoters
                if (event.user.type === 'PROFESSIONAL_PROMOTER') {
                    return false;
                }
                return true;
            }
        }

        // Recepcionistas não podem alterar dados de eventos (só usam app mobile)
        return false;
    }

    async canUpdateTickets(eventId: string, userId: string): Promise<boolean> {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: { user: true }
        });

        if (!event) {
            return false;
        }

        // Se o usuário é o dono do evento, permitir
        if (event.useruid === userId) {
            return true;
        }

        // Se o usuário é o owner do estabelecimento, verificar se pode gerenciar
        const establishment = await this.prisma.establishment.findUnique({
            where: { id: event.establishmentId }
        });
        if (establishment && establishment.userOwnerUid === userId) {
            // Owner não pode alterar tickets de eventos de promoters
            if (event.user.type === 'PROFESSIONAL_PROMOTER') {
                return false;
            }
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
            where: { id: ticket.eventId },
            include: { user: true }
        });

        if (!event) return false;

        // Se o usuário é o dono do evento, permitir
        if (event.useruid === userId) {
            return true;
        }

        // Se o usuário é o owner do estabelecimento, verificar se pode gerenciar
        const establishment = await this.prisma.establishment.findUnique({
            where: { id: event.establishmentId }
        });
        if (establishment && establishment.userOwnerUid === userId) {
            // Owner não pode alterar tickets de eventos de promoters
            if (event.user.type === 'PROFESSIONAL_PROMOTER') {
                return false;
            }
            return true;
        }

        // Recepcionistas não podem alterar dados de eventos (só usam app mobile)
        return false;
    }

    async canInsertCupons(eventId: string | null, userId: string): Promise<boolean> {
        // Se eventId for null, permitir criação de cupons globais para usuários que têm eventos
        if (!eventId) {
            // Verificar se o usuário tem pelo menos um evento criado por ele
            const userEvents = await this.prisma.event.findFirst({
                where: { useruid: userId }
            });
            return !!userEvents; // Retorna true se o usuário tem pelo menos um evento
        }

        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: { user: true }
        });

        if (!event) {
            return false;
        }

        // Para cupons específicos de eventos, apenas o criador do evento pode criar
        if (event.useruid === userId) {
            return true;
        }

        // Se o usuário é owner do estabelecimento, verificar se pode gerenciar
        if (event.establishmentId) {
            const establishment = await this.prisma.establishment.findUnique({
                where: { id: event.establishmentId }
            });
            
            if (establishment && establishment.userOwnerUid === userId) {
                // Owner NÃO pode criar cupons para eventos de promoters
                if (event.user.type === 'PROFESSIONAL_PROMOTER') {
                    return false;
                }
                // Owner pode criar cupons apenas para eventos criados por ele mesmo
                return event.useruid === userId;
            }
        }

        // Recepcionistas não podem alterar dados de eventos (só usam app mobile)
        return false;
    }

    async isManagerOfEvent(eventId: string, userId: string): Promise<boolean> {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: { user: true }
        });

        if (!event) {
            return false;
        }

        // Se o usuário é o dono do evento, é considerado manager
        if (event.useruid === userId) {
            return true;
        }

        // Se o usuário é o owner do estabelecimento, verificar se pode gerenciar
        const establishment = await this.prisma.establishment.findUnique({
            where: { id: event.establishmentId }
        });
        if (establishment && establishment.userOwnerUid === userId) {
            // Owner não pode gerenciar eventos de promoters
            if (event.user.type === 'PROFESSIONAL_PROMOTER') {
                return false;
            }
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
        // Se não há eventId, é um cupom global: permitir apenas se o useruid for o criador
        if (!eventId) {
            // Para cupons globais, apenas o criador pode editar
            const globalCupom = await this.prisma.cupom.findFirst({
                where: {
                    eventId: null,
                    useruid: userId
                }
            });
            return !!globalCupom;
        }
        
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: { user: true }
        });
        
        if (!event) {
            return false;
        }
        
        // Para cupons específicos de eventos, apenas o criador do evento pode editar
        // Owners NÃO podem editar cupons de eventos de Promoters
        if (event.useruid === userId) {
            return true;
        }
        
        // Se o usuário é owner do estabelecimento, verificar se pode gerenciar
        if (event.establishmentId) {
            const establishment = await this.prisma.establishment.findUnique({
                where: { id: event.establishmentId }
            });
            
            if (establishment && establishment.userOwnerUid === userId) {
                // Owner NÃO pode editar cupons de eventos de promoters
                if (event.user.type === 'PROFESSIONAL_PROMOTER') {
                    return false;
                }
                // Owner pode editar cupons apenas de eventos criados por ele mesmo
                return event.useruid === userId;
            }
        }
        
        // Recepcionistas não podem alterar dados de eventos (só usam app mobile)
        return false;
    }

    // Expor o PrismaService para uso em guards
    getPrisma() {
        return this.prisma;
    }

    // TODO OTHER PERMISSIONS REQUIRED TO MANAGER

}
