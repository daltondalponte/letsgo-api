import { Establishment } from "@application/establishment/entity/Establishment";

export class EstablishmentViewModel {

    static toHTTP(establishment: Establishment) {
        if (!establishment) return null
        return {
            id: establishment?.id,
            name: establishment?.name,
            address: establishment?.address,
            photos: establishment?.photos,
            coordinates: typeof establishment.coord === "string" ? JSON.parse(JSON.stringify(establishment?.coord)) : establishment.coord,
            createdAt: establishment?.createdAt,
            updatedAt: establishment?.updatedAt
        }
    }
}