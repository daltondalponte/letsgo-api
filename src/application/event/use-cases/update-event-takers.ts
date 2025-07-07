import { Injectable } from "@nestjs/common";
import { Coord, Event } from "../entity/Event";
import { EventRepository } from "../repositories/event-repository";
import { UnauthorizedException } from "@nestjs/common"

interface EventRequest {
    id: string;
    establishmentId: string;
    ticketTakers: string[];
}

@Injectable()
export class UpdateEventTakers {

    constructor(
        private eventRepository: EventRepository
    ) { }

    async execute(request: EventRequest): Promise<void> {
        const { ticketTakers, id, establishmentId } = request

        console.log('--- [UpdateEventTakers] Chamada recebida ---');
        console.log('Evento ID:', id);
        console.log('EstablishmentId:', establishmentId);
        console.log('TicketTakers recebidos:', ticketTakers);

        const event = await this.eventRepository.findById(id)

        if (event.establishmentId !== establishmentId) {
            throw new UnauthorizedException("Acesso negado!")
        }

        // Remove duplicidade do array recebido
        const uniqueTakers = Array.from(new Set(ticketTakers));
        console.log('TicketTakers a serem salvos:', uniqueTakers);

        const eventToEdit = new Event({
            ticketTakers: uniqueTakers,
            dateTimestamp: event.dateTimestamp,
            description: event.description,
            name: event.name,
            useruid: event.useruid,
            coordinates_event: event.coord,
            address: event.address,
            listNames: event.listNames,
            establishmentId: event.establishmentId,
            photos: event.photos,
            isActive: event.isActive,
            createdAt: event.createdAt
        }, event.id)

        await this.eventRepository.save(eventToEdit)
        console.log('--- [UpdateEventTakers] Evento salvo ---');
    }
}