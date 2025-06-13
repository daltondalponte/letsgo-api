
import { Cupom } from "@application/cupom/entity/Cupom";
import { Cupom as RawCupom } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";


export class PrismaCupomMapper {
    static toPrisma(cupom: Cupom) {
        return {
            id: cupom.id,
            code: cupom.code,
            quantity_available: cupom.quantityAvailable,
            expiresAt: cupom.expiresAt,
            eventId: cupom.eventId,
            descont_percent: cupom.descontPercent ? new Decimal(cupom.descontPercent) : null,
            discount_value: cupom.discountValue ? new Decimal(cupom.discountValue) : null,
            createdAt: cupom.createdAt,
            updatedAt: cupom.updatedAt,
        }
    }

    static toDomain(rawCupom: RawCupom) {
        return new Cupom({
            code: rawCupom.code,
            descont_percent: rawCupom.descont_percent ? Number(rawCupom.descont_percent) : null,
            discont_value: rawCupom.discount_value ? Number(rawCupom.discount_value) : null,
            quantity_available: rawCupom.quantity_available,
            expiresAt: rawCupom.expiresAt,
            createdAt: rawCupom.createdAt,
            updatedAt: rawCupom.updatedAt,
            eventId: rawCupom.eventId
        }, rawCupom?.id)
    }
}