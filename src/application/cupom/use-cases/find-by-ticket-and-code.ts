import { Injectable } from "@nestjs/common";
import { Cupom } from "../entity/Cupom";
import { CupomRepository } from "../repositories/cupom-repository";

interface CupomRequest {
    ticketId: string;
    code: string;
    eventId: string
}

interface CupomResponse {
    cupom: Cupom
}

@Injectable()
export class FindCuponsByTicketIdAndCode {

    constructor(
        private cupomRepository: CupomRepository
    ) { }

    async execute(request: CupomRequest): Promise<CupomResponse> {
        const { ticketId, code, eventId } = request

        const cupom = await this.cupomRepository.findByTicketIdAndCode(ticketId, code, eventId)

        return { cupom }
    }
}