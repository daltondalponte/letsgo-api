import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { TicketRepository } from "@application/ticket/repositories/ticket-repository";
import { Ticket } from "@application/ticket/entity/Ticket";
import { PrismaTicketMapper } from "../../mappers/ticket/prisma-ticket-mapper";
import { Event, Payment, TicketSale } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";


@Injectable()
export class PrismaTicketRepository implements TicketRepository {

    constructor(
        private prisma: PrismaService
    ) { }

    async createCreateMany(tickets: Ticket[]): Promise<void> {
        const rawTickets = tickets.map(PrismaTicketMapper.toPrisma)

        await this.prisma.ticket.createMany({
            data: rawTickets
        })
    }


    async create(ticket: Ticket): Promise<void> {
        const rawTicket = PrismaTicketMapper.toPrisma(ticket)

        await this.prisma.ticket.create({
            data: rawTicket
        })
    }

    async findByEventId(eventId: string): Promise<any> {
        const tickets = await this.prisma.ticket.findMany({
            where: {
                AND: [
                    { eventId },
                    {
                        quantity_available: {
                            gt: 0
                        }
                    }
                ]
            },
            include: {
                TicketCupons: {
                    include: {
                        cupom: true
                    }
                },
                TicketSale: {
                    select: {
                        CuponsAplicados: {
                            select: {
                                id: true // Removido 'cupom: true' que estava causando erro
                            }
                        },
                        createdAt: true,
                        updatedAt: true,
                        payment: true,
                        user: true
                    }
                }
            }
        })

        // Modificado para evitar acesso direto a propriedades que podem não existir
        return {
            tickets: tickets.map(t => {
                const ticketDomain = PrismaTicketMapper.toDomain({
                    createdAt: t.createdAt,
                    description: t.description,
                    eventId: t.eventId,
                    id: t.id,
                    price: t.price,
                    quantity_available: t.quantity_available,
                    updatedAt: t.updatedAt
                });
                
                // Extrair cupons de forma segura
                const cupons = t.TicketCupons ? 
                    t.TicketCupons.map(c => c.cupom).filter(Boolean) : 
                    [];
                
                return {
                    ...ticketDomain,
                    cupons
                };
            })
        }
    }

    async findByEventAdminId(eventId: string): Promise<any> {
        const tickets = await this.prisma.ticket.findMany({
            where: {
                AND: [
                    { eventId }
                ]
            },
            include: {
                TicketCupons: {
                    include: {
                        cupom: true
                    }
                },
                event: true,
                TicketSale: {
                    select: {
                        id: true,
                        CuponsAplicados: {
                            select: {
                                id: true // Removido 'cupom: true' que estava causando erro
                            }
                        },
                        ticket: true,
                        createdAt: true,
                        updatedAt: true,
                        payment: true,
                        user: true
                    }
                }
            }
        })

        // Modificado para evitar acesso direto a propriedades que podem não existir
        return {
            tickets: tickets.map(t => {
                const ticketDomain = PrismaTicketMapper.toDomain({
                    createdAt: t.createdAt,
                    description: t.description,
                    eventId: t.eventId,
                    id: t.id,
                    price: t.price,
                    quantity_available: t.quantity_available,
                    updatedAt: t.updatedAt
                });
                
                // Extrair cupons de forma segura
                const cupons = t.TicketCupons ? 
                    t.TicketCupons.map(c => c.cupom).filter(Boolean) : 
                    [];
                
                return {
                    ...ticketDomain,
                    cupons,
                    sales: t.TicketSale || [],
                    eventId: t.eventId // Usando eventId em vez de event
                };
            })
        }
    }

    async createPurchase(ticketId: string, userId: string, paymentId: string, cupomId?: string): Promise<string> {

        try {
            const ticketSale = await this.prisma.ticketSale.create({
                data: {
                    cupomId,
                    paymentId,
                    useruid: userId,
                    ticketId
                }
            })

            return ticketSale.id
        } catch (e) {
            console.error(e);
            throw new BadRequestException("Ocorreu um erro")
        }
    }

    async findPurchaseUserId(userId: string): Promise<any[]> {
        const ticketsPurchase = await this.prisma.ticketSale.findMany({
            where: {
                useruid: userId
            },
            include: {
                ticket: {
                    select: {
                        event: true,
                        id: true,
                        description: true,
                        price: true
                    }
                },
                payment: true
            }
        })

        return ticketsPurchase
    }

    async findPurchaseById(id: string): Promise<TicketSale & {
        ticket: {
            event: Event;
            description: string;
            id: string;
            price: Decimal;
        };
        payment: Payment;
    }> {
        const ticketsPurchase = await this.prisma.ticketSale.findUnique({
            where: {
                id
            },
            include: {
                user: true,
                cupom: true,
                ticket: {
                    select: {
                        event: true,
                        id: true,
                        description: true,
                        price: true,
                    }
                },
                payment: true
            }
        })

        return ticketsPurchase
    }

    async findAll(): Promise<Ticket[]> {
        const tickets = await this.prisma.ticket.findMany({
            include: {
                event: true,
                TicketSale: {
                    include: {
                        user: true
                    }
                },
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        
        return tickets.map(ticket => {
            // Mapear para o domínio de forma segura
            return PrismaTicketMapper.toDomain(ticket);
        });
    }

    findByUserUid(uid: string): Promise<any | null> {
        // Implementar lógica para buscar tickets por useruid, se necessário
        // Por enquanto, retorna null ou lança um erro, dependendo da necessidade
        return Promise.resolve(null);
    }

    async findByIdIncludeOwnerEventStripeDetail(id: string, code: string): Promise<any> {
        const ticket = await this.prisma.ticket.findUnique({
            where: {
                id
            },
            include: {
                event: {
                    include: {
                        user: {
                            select: { name: true, stripeAccountId: true }
                        },
                        establishment: {
                            include: {
                                userOwner: {
                                    select: { name: true, stripeAccountId: true }
                                }
                            }
                        }
                    }
                },
                TicketCupons: {
                    select: {
                        cupom: true
                    }
                }
            }
        })

        console.log(ticket);


        return ticket
    }

    async findById(id: string): Promise<any> {
        const ticket = await this.prisma.ticket.findUnique({
            where: {
                id
            }
        })

        return PrismaTicketMapper.toDomain(ticket)
    }

    async save(ticket: Ticket): Promise<void> {
        const rawTicket = PrismaTicketMapper.toPrisma(ticket)
        delete rawTicket.id
        await this.prisma.ticket.update({
            where: {
                id: ticket.id
            },
            data: rawTicket
        })
    }

    async savePurchase(id: string): Promise<void> {
        await this.prisma.ticketSale.update({
            where: {
                id
            },
            data: {
                ticket_status: "CONFERRED"
            }
        })
    }

}
