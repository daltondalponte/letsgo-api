import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { EventRepository } from "@application/event/repositories/event-repository";
import { Event } from "@application/event/entity/Event";
import { PrismaEventMapper } from "../../mappers/event/prisma-event-mapper";
import { EventApprovalRequest } from "@application/event-manager/use-cases/create-event-approval";
import { EventViewModel } from '../../../../http/view-models/event/event-view-model';
import { EventManagerRepository } from "@application/event-manager/repositories/event-manager-repository";

@Injectable()
export class PrismaEventRepository implements EventRepository {

    constructor(
        private prisma: PrismaService,
        private eventManagerRepository: EventManagerRepository // injeção do repo de managers
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

    async create(event: Event, tickets?: Array<{category: string; price: number; quantity: number}>): Promise<void> {
        const rawEvent = PrismaEventMapper.toPrisma(event)
        
        try {
            const createdEvent = await this.prisma.event.create({
                data: {
                    name: rawEvent.name,
                    dateTimestamp: rawEvent.dateTimestamp,
                    endTimestamp: rawEvent.endTimestamp,
                    description: rawEvent.description,
                    photos: rawEvent.photos,
                    listNames: rawEvent.listNames,
                    address: rawEvent.address,
                    isActive: rawEvent.isActive,
                    coordinates_event: rawEvent.coordinates_event as any,
                    ...(event.establishmentId && { establishment: { connect: { id: event.establishmentId } } }),
                    ...(event.useruid && { user: { connect: { uid: event.useruid } } })
                }
            })

            // Se houver tickets, criá-los
            if (tickets && tickets.length > 0) {
                const ticketData = tickets.map(ticket => ({
                    description: ticket.category,
                    price: ticket.price,
                    quantity_available: ticket.quantity,
                    eventId: createdEvent.id
                }));

                await this.prisma.ticket.createMany({
                    data: ticketData
                });
            }
        } catch (error) {
            console.error('Erro ao criar evento:', error);
            
            // Verificar se é erro de constraint única
            if (error.code === 'P2002') {
                const target = error.meta?.target;
                
                if (target && target.includes('establishmentId') && target.includes('dateTimestamp')) {
                    // Buscar informações do estabelecimento para dar uma mensagem mais clara
                    try {
                        const existingEvent = await this.prisma.event.findFirst({
                            where: {
                                establishmentId: event.establishmentId,
                                dateTimestamp: event.dateTimestamp
                            },
                            include: {
                                establishment: true
                            }
                        });
                        
                        if (existingEvent) {
                            const eventDate = new Date(existingEvent.dateTimestamp);
                            const formattedDate = eventDate.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            });
                            const formattedTime = eventDate.toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                            
                            const establishmentName = existingEvent.establishment?.name || 'este estabelecimento';
                            
                            throw new BadRequestException(
                                `Já existe um evento agendado em ${establishmentName} para ${formattedDate} às ${formattedTime}. ` +
                                `Não é possível criar eventos simultâneos no mesmo estabelecimento. ` +
                                `Por favor, escolha uma data/hora diferente ou aguarde o evento atual terminar.`
                            );
                        }
                    } catch (establishmentError) {
                        // Se não conseguir buscar o estabelecimento, usar mensagem genérica
                        throw new BadRequestException(
                            'Já existe um evento agendado neste estabelecimento para a mesma data e horário. ' +
                            'Não é possível criar eventos simultâneos. Por favor, escolha uma data/hora diferente.'
                        );
                    }
                }
            }
            
            // Para outros tipos de erro, verificar casos específicos
            if (error.code === 'P2003') {
                // Erro de foreign key
                const fieldName = error.meta?.field_name;
                if (fieldName?.includes('establishmentId')) {
                    throw new BadRequestException(
                        'O estabelecimento selecionado não existe ou foi removido. ' +
                        'Por favor, selecione um estabelecimento válido.'
                    );
                }
                if (fieldName?.includes('useruid')) {
                    throw new BadRequestException(
                        'Usuário não encontrado. Por favor, faça login novamente.'
                    );
                }
            }
            
            if (error.code === 'P2000') {
                // Erro de tamanho de campo
                throw new BadRequestException(
                    'Um dos campos excedeu o tamanho máximo permitido. ' +
                    'Por favor, verifique os dados e tente novamente.'
                );
            }
            
            if (error.code === 'P2001') {
                // Erro de registro não encontrado
                throw new BadRequestException(
                    'Dados não encontrados. Por favor, verifique as informações e tente novamente.'
                );
            }
            
            // Para outros tipos de erro, manter mensagem genérica
            throw new BadRequestException("Ocorreu um erro ao criar o evento. Tente novamente.")
        }
    }

    async findManyByUserUidOrEstablishmentId(useruid?: string, establishmentId?: string, approvedOnly?: boolean): Promise<any[]> {

        try {
            // Construir where clause baseado nos parâmetros fornecidos
            let whereClause: any = {};

            if (useruid) {
                // Para promoters, filtrar apenas eventos criados por eles
                whereClause.useruid = useruid;
                
                // Adicionar filtro de data futura para promoters
                if (!whereClause.AND) whereClause.AND = [];
                whereClause.AND.push({
                    dateTimestamp: {
                        gte: new Date()
                    }
                });
            } else if (establishmentId) {
                // Para owners, mostrar apenas eventos do seu estabelecimento
                whereClause.establishmentId = establishmentId;
            }

            // Se approvedOnly for true, filtrar apenas eventos ativos (aprovados)
            if (approvedOnly) {
                if (!whereClause.AND) whereClause.AND = [];
                whereClause.AND.push({
                    isActive: true
                });
            }

            const events = await this.prisma.event.findMany({
                where: whereClause,
                include: {
                    establishment: true,
                    user: true, // Incluir dados do usuário para mostrar quem criou
                    ManageEvents: {
                        include: {
                            user: true // Incluir dados dos usuários managers
                        }
                    },
                    Ticket: true // Incluir os tickets do evento
                },
                orderBy: {
                    dateTimestamp: 'desc' // Ordenar por data, mais recentes primeiro
                }
            });

            // Retornar dados com informação de quem criou e managers
            const mappedEvents = events.map(e => {
                // Determinar o status do evento
                let approvalStatus = 'PENDING';
                
                if (e.isActive) {
                    // Se o evento está ativo, verificar se já passou
                    const now = new Date();
                    const eventStartDate = new Date(e.dateTimestamp);
                    const eventEndDate = e.endTimestamp ? new Date(e.endTimestamp) : null;
                    
                    // Se tem horário de término, usar ele. Senão, usar apenas o início
                    const eventEndTime = eventEndDate || eventStartDate;
                    
                    if (now > eventEndTime) {
                        approvalStatus = 'FINALIZADO';
                    } else {
                        approvalStatus = 'APPROVED';
                    }
                } else {
                    // Se não está ativo, verificar se foi rejeitado
                    approvalStatus = 'PENDING';
                }
                
                const mappedEvent = {
                    id: e.id,
                    name: e.name,
                    description: e.description,
                    dateTimestamp: e.dateTimestamp.toISOString(),
                    endTimestamp: e.endTimestamp ? e.endTimestamp.toISOString() : null,
                    address: e.address,
                    photos: e.photos,
                    isActive: e.isActive,
                    useruid: e.useruid,
                    establishmentId: e.establishmentId,
                    approvalStatus: approvalStatus,
                    establishment: e.establishment ? {
                        id: e.establishment.id,
                        name: e.establishment.name,
                        address: e.establishment.address
                    } : null,
                    creator: e.user ? {
                        id: e.user.uid,
                        name: e.user.name,
                        email: e.user.email,
                        type: e.user.type
                    } : null,
                    managers: e.ManageEvents ? e.ManageEvents.map(manager => ({
                        id: manager.id,
                        user: manager.user ? {
                            id: manager.user.uid,
                            name: manager.user.name,
                            email: manager.user.email
                        } : null
                    })) : [],
                    tickets: e.Ticket ? e.Ticket.map(ticket => ({
                        id: ticket.id,
                        description: ticket.description,
                        price: ticket.price,
                        quantity_available: ticket.quantity_available
                    })) : [],
                    createdAt: e.createdAt.toISOString(),
                    updatedAt: e.updatedAt.toISOString()
                };

                return mappedEvent;
            });

            return mappedEvents;

        } catch (error) {
            console.error('Erro no findManyByUserUidOrEstablishmentId:', error);
            throw error;
        }
    }

    async findAll(): Promise<any[]> {
        const events = await this.prisma.event.findMany({
            include: {
                establishment: true,
                Ticket: true,
                user: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return events.map(e => ({
            ...PrismaEventMapper.toDomain(e),
            user: e.user,
            establishment: e.establishment
        }));
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

    async findById(id: string): Promise<any> {
        const rawEvent = await this.prisma.event.findUnique({
            where: { id },
            include: {
                establishment: true,
                Ticket: true,
                user: true,
                ManageEvents: {
                    include: {
                        user: true
                    }
                },
                EventApprovals: true
            }
        })

        if (!rawEvent) {
            return null;
        }

        // Determinar o status do evento
        let approvalStatus = 'PENDING';
        
        if (rawEvent.isActive) {
            // Se o evento está ativo, verificar se já passou
            const now = new Date();
            const eventStartDate = new Date(rawEvent.dateTimestamp);
            const eventEndDate = rawEvent.endTimestamp ? new Date(rawEvent.endTimestamp) : null;
            
            // Se tem horário de término, usar ele. Senão, usar apenas o início
            const eventEndTime = eventEndDate || eventStartDate;
            
            if (now > eventEndTime) {
                approvalStatus = 'FINALIZADO';
            } else {
                approvalStatus = 'APPROVED';
            }
        } else {
            // Se não está ativo, verificar se foi rejeitado
            approvalStatus = 'PENDING';
        }

        return {
            id: rawEvent.id,
            name: rawEvent.name,
            description: rawEvent.description,
            dateTimestamp: rawEvent.dateTimestamp.toISOString(),
            endTimestamp: rawEvent.endTimestamp ? rawEvent.endTimestamp.toISOString() : null,
            address: rawEvent.address,
            photos: rawEvent.photos,
            isActive: rawEvent.isActive,
            useruid: rawEvent.useruid,
            establishmentId: rawEvent.establishmentId,
            approvalStatus: approvalStatus,
            establishment: rawEvent.establishment ? {
                id: rawEvent.establishment.id,
                name: rawEvent.establishment.name,
                address: rawEvent.establishment.address
            } : null,
            creator: rawEvent.user ? {
                id: rawEvent.user.uid,
                name: rawEvent.user.name,
                email: rawEvent.user.email,
                type: rawEvent.user.type
            } : null,
            managers: rawEvent.ManageEvents ? rawEvent.ManageEvents.map(manager => ({
                id: manager.id,
                user: manager.user ? {
                    id: manager.user.uid,
                    name: manager.user.name,
                    email: manager.user.email
                } : null
            })) : [],
            tickets: rawEvent.Ticket ? rawEvent.Ticket.map(ticket => ({
                id: ticket.id,
                description: ticket.description,
                price: ticket.price,
                quantity_available: ticket.quantity_available
            })) : [],
            createdAt: rawEvent.createdAt.toISOString(),
            updatedAt: rawEvent.updatedAt.toISOString()
        };
    }

    async save(event: Event): Promise<void> {
        await this.prisma.event.update({
            where: {
                id: event.id!
            },
            data: {
                name: event.name,
                dateTimestamp: event.dateTimestamp,
                endTimestamp: event.endTimestamp,
                description: event.description,
                photos: event.photos,
                listNames: event.listNames || [],
                address: event.address || null,
                isActive: event.isActive,
                coordinates_event: event.coordinates_event as any,
                ...(event.establishmentId && { establishment: { connect: { id: event.establishmentId } } }),
                ...(event.useruid && { user: { connect: { uid: event.useruid } } })
            }
        })
    }

    async findPendingApprovals(establishmentId: string): Promise<any[]> {
        const events = await this.prisma.event.findMany({
            where: {
                establishmentId,
                isActive: false // Eventos inativos (pendentes de aprovação)
            },
            include: {
                user: true,
                establishment: true,
                EventApprovals: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Retornar todos os eventos inativos (pendentes de aprovação)
        return events.map(event => ({
            id: event.id,
            name: event.name,
            description: event.description,
            dateTimestamp: event.dateTimestamp.toISOString(),
            address: event.address,
            photos: event.photos,
            promoter: event.user ? {
                id: event.user.uid,
                name: event.user.name,
                email: event.user.email
            } : null,
            establishment: event.establishment ? {
                id: event.establishment.id,
                name: event.establishment.name
            } : null,
            status: event.EventApprovals?.[0]?.status || "PENDING",
            createdAt: event.createdAt.toISOString()
        }));
    }

    async approveEvent(eventId: string, useruid: string): Promise<void> {
        // Criar ou atualizar a aprovação
        await this.prisma.eventApprovals.upsert({
            where: {
                eventId
            },
            update: {
                status: 'APPROVE',
                useruid,
                updatedAt: new Date()
            },
            create: {
                eventId,
                useruid,
                status: 'APPROVE'
            }
        });

        // Ativar o evento
        await this.prisma.event.update({
            where: {
                id: eventId
            },
            data: {
                isActive: true
            }
        });
    }

    async rejectEvent(eventId: string, useruid: string): Promise<void> {
        // Criar ou atualizar a rejeição
        await this.prisma.eventApprovals.upsert({
            where: {
                eventId
            },
            update: {
                status: 'REJECT',
                useruid,
                updatedAt: new Date()
            },
            create: {
                eventId,
                useruid,
                status: 'REJECT'
            }
        });

        // Manter o evento inativo
        await this.prisma.event.update({
            where: {
                id: eventId
            },
            data: {
                isActive: false
            }
        });
    }

    async delete(id: string): Promise<void> {
        // Primeiro, deletar todos os tickets do evento
        await this.prisma.ticket.deleteMany({
            where: {
                eventId: id
            }
        });

        // Deletar todas as aprovações do evento
        await this.prisma.eventApprovals.deleteMany({
            where: {
                eventId: id
            }
        });

        // Deletar todos os event managers do evento
        await this.prisma.eventsReceptionist.deleteMany({
            where: {
                eventId: id
            }
        });

        // Finalmente, deletar o evento
        await this.prisma.event.delete({
            where: {
                id
            }
        });
    }

    async hasTicketSales(eventId: string): Promise<boolean> {
        const ticketSales = await this.prisma.ticketSale.findFirst({
            where: {
                ticket: {
                    eventId
                }
            }
        });

        return !!ticketSales;
    }
}
