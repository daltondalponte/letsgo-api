import { Injectable } from "@nestjs/common";
import { CupomRepository } from "../repositories/cupom-repository";

interface AttachCupomRequest {
    cupomId: string;
    ticketId: string;
}


@Injectable()
export class AttachCupomTicket {

    constructor(
        private cupomRepository: CupomRepository
    ) { }

    async execute(request: AttachCupomRequest): Promise<void> {
        const { cupomId, ticketId } = request

        await this.cupomRepository.attachCupomTicket(cupomId, ticketId)

    }
}