import { Injectable } from "@nestjs/common";
import { Cupom } from "../entity/Cupom";
import { CupomRepository } from "../repositories/cupom-repository";

interface CupomRequest {
    ticketId: string;
}

interface CupomResponse {
    cupons: Cupom[]
}

@Injectable()
export class FindCuponsByTicketId {

    constructor(
        private cupomRepository: CupomRepository
    ) { }

    async execute(request: CupomRequest): Promise<CupomResponse> {
        const { ticketId } = request

        const cupons = await this.cupomRepository.findByTicketId(ticketId)

        return { cupons }
    }
}