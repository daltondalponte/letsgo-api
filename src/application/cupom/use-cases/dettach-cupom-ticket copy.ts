import { Injectable } from "@nestjs/common";
import { CupomRepository } from "../repositories/cupom-repository";

interface DettachCupomRequest {
    cupomId: string;
    ticketId: string;
}


@Injectable()
export class DettachCupomTicket {

    constructor(
        private cupomRepository: CupomRepository
    ) { }

    async execute(request: DettachCupomRequest): Promise<void> {
        const { cupomId, ticketId } = request

        await this.cupomRepository.dettachCupomTicket(cupomId, ticketId)

    }
}