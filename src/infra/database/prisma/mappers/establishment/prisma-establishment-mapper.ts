import { Coord, Establishment } from "@application/establishment/entity/Establishment";
import { Establishment as RawEstablishment } from "@prisma/client";


export class PrismaEstablishmentMapper {
    static toPrisma(establishment: Establishment) {
        return {
            id: establishment?.id,
            name: establishment?.name,
            address: establishment?.address,
            userOwnerUid: establishment?.userOwnerUid,
            coordinates: JSON.stringify(establishment?.coord),
            photos: establishment?.photos,
            description: establishment?.description,
            contactPhone: establishment?.contactPhone,
            website: establishment?.website,
            socialMedia: establishment?.socialMedia ? JSON.stringify(establishment?.socialMedia) : null,
            createdAt: establishment?.createdAt,
            updatedAt: establishment?.updatedAt
        }
    }

    static toDomain(rawEstablishment: RawEstablishment) {
        // Tratar o campo socialMedia que pode vir como objeto ou string
        let socialMedia = null;
        if (rawEstablishment?.socialMedia) {
            if (typeof rawEstablishment.socialMedia === 'string') {
                try {
                    socialMedia = JSON.parse(rawEstablishment.socialMedia);
                } catch (error) {
                    console.warn('Erro ao fazer parse do socialMedia:', error);
                    socialMedia = null;
                }
            } else if (typeof rawEstablishment.socialMedia === 'object') {
                socialMedia = rawEstablishment.socialMedia;
            }
        }

        return new Establishment({
            name: rawEstablishment?.name,
            address: rawEstablishment?.address,
            userOwnerUid: rawEstablishment?.userOwnerUid,
            coordinates: rawEstablishment?.coordinates as unknown as Coord,
            photos: rawEstablishment?.photos,
            description: rawEstablishment?.description,
            contactPhone: rawEstablishment?.contactPhone,
            website: rawEstablishment?.website,
            socialMedia: socialMedia,
            createdAt: rawEstablishment?.createdAt,
            updatedAt: rawEstablishment?.updatedAt
        }, rawEstablishment?.id)
    }
}