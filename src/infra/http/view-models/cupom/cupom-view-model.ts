import { Cupom } from "@application/cupom/entity/Cupom";


export class CupomViewModel {

    static toHTTP(cupom: Cupom) {
        return {
            id: cupom.id,
            code: cupom.code,
            eventId: cupom.eventId,
            expiresAt: cupom.expiresAt,
            quantityAvailable: cupom.quantityAvailable,
            descontPercent: Number(cupom.descontPercent),
            discontValue: Number(cupom.discountValue),
            createdAt: cupom?.createdAt,
            updatedAt: cupom?.updatedAt
        }
    }
}