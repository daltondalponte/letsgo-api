import { Injectable } from "@nestjs/common";
import { Cupom, CupomProps } from "../entity/Cupom";
import { CupomRepository } from "../repositories/cupom-repository";

interface CupomRequest extends Omit<CupomProps, "createdAt" | "updatedAt"> { }

interface CupomResponse {
    cupom: Cupom
}

@Injectable()
export class CreateCupom {

    constructor(
        private cupomRepository: CupomRepository
    ) { }

    async execute(request: CupomRequest): Promise<CupomResponse> {
        const { code, descont_percent, quantity_available, expiresAt, eventId, discont_value } = request

        const cupom = new Cupom({
            code,
            descont_percent,
            quantity_available,
            discont_value,
            eventId,
            expiresAt
        })

        await this.cupomRepository.create(cupom)

        return { cupom }
    }
}