
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
            createdAt: establishment?.createdAt,
            updatedAt: establishment?.updatedAt
        }
    }

    static toDomain(rawEstablishment: RawEstablishment) {
        return new Establishment({
            name: rawEstablishment?.name,
            address: rawEstablishment?.address,
            userOwnerUid: rawEstablishment?.userOwnerUid,
            coordinates: rawEstablishment?.coordinates as unknown as Coord,
            photos: rawEstablishment?.photos,
            createdAt: rawEstablishment?.createdAt,
            updatedAt: rawEstablishment?.updatedAt
        }, rawEstablishment?.id)
    }
}