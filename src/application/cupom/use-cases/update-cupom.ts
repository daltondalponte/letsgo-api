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
}

@Injectable()
export class UpdateCupom {

    constructor(
        private cupomRepository: CupomRepository
    ) { }

    async execute(request: CupomRequest): Promise<void> {
        const { id, code, descont_percent, discount_value, quantity_available, description, eventId } = request

        // DEBUG: Log dos valores recebidos
        console.log('=== DEBUG UPDATE CUPOM USE CASE ===');
        console.log('request:', request);
        console.log('descont_percent recebido:', descont_percent, 'tipo:', typeof descont_percent);
        console.log('discount_value recebido:', discount_value, 'tipo:', typeof discount_value);
        console.log('eventId recebido:', eventId, 'tipo:', typeof eventId);

        const cupom = await this.cupomRepository.findById(id)

        if (!cupom) {
            throw new BadRequestException("Cupom não encontrado")
        }

        console.log('cupom original:', {
            descont_percent: cupom.descontPercent,
            discount_value: cupom.discountValue
        });

        const updatedCupom = new Cupom({
            code: code ?? cupom.code,
            descont_percent: descont_percent !== null && descont_percent !== undefined ? descont_percent : cupom.descontPercent,
            discount_value: discount_value !== null && discount_value !== undefined ? discount_value : cupom.discountValue,
            quantity_available: quantity_available ?? cupom.quantityAvailable,
            updatedAt: new Date(),
            eventId: eventId !== undefined ? eventId : cupom.eventId,
            createdAt: cupom.createdAt,
            expiresAt: cupom.expiresAt,
            useruid: cupom.useruid,
            description: description ?? cupom.description
        }, cupom.id)

        console.log('cupom atualizado:', {
            descont_percent: updatedCupom.descontPercent,
            discount_value: updatedCupom.discountValue
        });

        await this.cupomRepository.save(updatedCupom)

    }
}