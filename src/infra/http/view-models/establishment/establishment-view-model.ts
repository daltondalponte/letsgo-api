import { Establishment } from "@application/establishment/entity/Establishment";

export class EstablishmentViewModel {

    static toHTTP(establishment: Establishment) {
        if (!establishment) return null
        return {
            id: establishment?.id,
            name: establishment?.name,
            address: establishment?.address,
            photos: establishment?.photos,
            description: establishment?.description,
            contactPhone: establishment?.contactPhone,
            website: establishment?.website,
            socialMedia: establishment?.socialMedia,
            coordinates: establishment?.coord,
            userOwnerUid: establishment?.userOwnerUid,
            createdAt: establishment?.createdAt,
            updatedAt: establishment?.updatedAt
        }
    }
}