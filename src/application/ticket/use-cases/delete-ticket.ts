import { Injectable } from "@nestjs/common";
import { TicketRepository } from "../repositories/ticket-repository";
import { FindEventById } from "@application/event/use-cases/find-event-by-id";
import { FindEstablishmentByUserUid } from "@application/establishment/use-cases/find-many-by-user";
import { UnauthorizedException } from "@nestjs/common";

interface TicketRequest {
    id: string;
    useruid: string;
}

@Injectable()
export class DeleteTicket {

    constructor(
        private ticketRepository: TicketRepository,
        private findEvent: FindEventById,
        private findEstablishment: FindEstablishmentByUserUid
    ) { }

    async execute(request: TicketRequest): Promise<void> {
        const { id, useruid } = request

        const ticket = await this.ticketRepository.findById(id)

        const { event } = await this.findEvent.execute({ id: ticket.eventId })
        
        // Verificar se o usuário é o dono do evento
        if (event.useruid === useruid) {
            // Dono do evento pode deletar tickets
            await this.ticketRepository.delete(id)
            return
        }

        // Se não for o dono do evento, verificar se é dono do estabelecimento
        try {
            const { establishment } = await this.findEstablishment.execute({ useruid })

            if (event.establishmentId !== establishment.id) {
                throw new UnauthorizedException("Acesso negado!")
            }

            await this.ticketRepository.delete(id)
        } catch (error) {
            // Se não conseguir verificar o estabelecimento, negar acesso
            throw new UnauthorizedException("Acesso negado!")
        }
    }
} 