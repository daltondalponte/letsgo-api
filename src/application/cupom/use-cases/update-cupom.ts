import { Injectable, BadRequestException } from "@nestjs/common";
import { CupomRepository } from "../repositories/cupom-repository";
import { Cupom } from "../entity/Cupom";

interface CupomRequest {
    id: string;
    code: string;
    descont_percent?: number;
    discount_value?: number;
    quantity_available: number;
    description?: string;
    eventId?: string;
    expiresAt?: string;
}

@Injectable()
export class UpdateCupom {

    constructor(
        private cupomRepository: CupomRepository
    ) { }

    async execute(request: CupomRequest): Promise<void> {
        const { id, code, descont_percent, discount_value, quantity_available, description, eventId, expiresAt } = request

        const cupom = await this.cupomRepository.findById(id)

        if (!cupom) {
            throw new BadRequestException("Cupom não encontrado")
        }

        const updatedCupom = new Cupom({
            code: code ?? cupom.code,
            descont_percent: descont_percent !== null && descont_percent !== undefined ? descont_percent : cupom.descontPercent,
            discount_value: discount_value !== null && discount_value !== undefined ? discount_value : cupom.discountValue,
            quantity_available: quantity_available ?? cupom.quantityAvailable,
            updatedAt: new Date(),
            eventId: eventId !== undefined ? eventId : cupom.eventId,
            createdAt: cupom.createdAt,
            expiresAt: expiresAt !== undefined ? new Date(expiresAt) : cupom.expiresAt,
            useruid: cupom.useruid,
            description: description ?? cupom.description
        }, cupom.id)

        await this.cupomRepository.save(updatedCupom)
    }
}