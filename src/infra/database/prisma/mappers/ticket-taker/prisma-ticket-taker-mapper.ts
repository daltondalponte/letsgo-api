import { TicketTaker } from "@application/ticketTaker/entity/TicketTaker"
import { TicketTaker as RawTicketTaker } from "@prisma/client"

export class PrismaTicketTackerMapper {
    static toPrisma(ticketTaker: TicketTaker) {
        return {
            id: ticketTaker.id,
            userOwnerUid: ticketTaker.userOwnerUid,
            userTicketTakerUid: ticketTaker.userTicketTakerUid,
            createdAt: ticketTaker.createdAt,
            updatedAt: ticketTaker.updatedAt
        }
    }

    static toDomain(rawTicketTaker: RawTicketTaker) {
        return new TicketTaker({
            userOwnerUid: rawTicketTaker.userOwnerUid,
            userTicketTakerUid: rawTicketTaker.userTicketTakerUid,
            createdAt: rawTicketTaker.createdAt,
            updatedAt: rawTicketTaker.updatedAt
        }, rawTicketTaker.id)
    }
}