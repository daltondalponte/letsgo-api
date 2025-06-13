import { Injectable, BadRequestException } from "@nestjs/common";
import { CupomRepository } from "../repositories/cupom-repository";
import { Cupom } from "../entity/Cupom";

interface CupomRequest {
    id: string;
    code: string;
    descont_percent: number;
    quantity_available: number;
}

@Injectable()
export class UpdateCupom {

    constructor(
        private cupomRepository: CupomRepository
    ) { }

    async execute(request: CupomRequest): Promise<void> {
        const { id, code, descont_percent, quantity_available } = request

        const cupom = await this.cupomRepository.findById(id)

        if (!cupom) {
            throw new BadRequestException("Cupom não encontrado")
        }

        const updatedCupom = new Cupom({
            code: code ?? cupom.code,
            descont_percent: descont_percent ?? cupom.descontPercent,
            quantity_available: quantity_available ?? cupom.quantityAvailable,
            updatedAt: new Date(),
            eventId: cupom.eventId,
            createdAt: cupom.createdAt,
            expiresAt: cupom.expiresAt
        }, cupom.id)

        await this.cupomRepository.save(updatedCupom)

    }
}