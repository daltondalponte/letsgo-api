import { Injectable } from "@nestjs/common";
import { TicketRepository } from "../repositories/ticket-repository";
import { Ticket } from "../entity/Ticket";
import { FindEventById } from "@application/event/use-cases/find-event-by-id";
import { FindEstablishmentByUserUid } from "@application/establishment/use-cases/find-many-by-user";
import { UnauthorizedException } from "@nestjs/common";


interface TicketRequest {
    description: string;
    price: number;
    eventId: string;
    quantity_available: number;
    useruid: string;
}

interface TicketResponse {
    ticket: Ticket
}

@Injectable()
export class CreateTicket {

    constructor(
        private ticketRepository: TicketRepository,
        private findEvent: FindEventById,
        private findEstablishment: FindEstablishmentByUserUid
    ) { }

    async execute(request: TicketRequest): Promise<TicketResponse> {
        const { description, eventId, price, quantity_available, useruid } = request

        // Verificar se o usuário é o dono do evento
        const { event } = await this.findEvent.execute({ id: eventId })
        
        if (event.useruid === useruid) {
            // Dono do evento pode criar tickets
            const ticket = new Ticket({
                description, eventId, price, quantity_available, useruid
            })

            await this.ticketRepository.create(ticket)
            return { ticket }
        }

        // Se não for o dono do evento, verificar se é dono do estabelecimento
        try {
            const { establishment } = await this.findEstablishment.execute({ useruid })

            if (event.establishmentId !== establishment.id) {
                throw new UnauthorizedException("Acesso negado!")
            }

            const ticket = new Ticket({
                description, eventId, price, quantity_available, useruid
            })

            await this.ticketRepository.create(ticket)

            return { ticket }
        } catch (error) {
            // Se não conseguir verificar o estabelecimento, negar acesso
            throw new UnauthorizedException("Acesso negado!")
        }
    }
}