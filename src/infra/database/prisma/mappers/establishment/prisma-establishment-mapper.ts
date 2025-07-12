import { Coord, Establishment } from "@application/establishment/entity/Establishment";
import { Establishment as RawEstablishment } from "@prisma/client";


export class PrismaEstablishmentMapper {
    static toPrisma(establishment: Establishment) {
        console.log('🔄 PrismaEstablishmentMapper.toPrisma - Convertendo para Prisma:');
        console.log('Coordenadas da entidade:', establishment?.coord);
        
        const coordinatesString = JSON.stringify(establishment?.coord);
        console.log('Coordenadas convertidas para string:', coordinatesString);
        
        return {
            id: establishment?.id,
            name: establishment?.name,
            address: establishment?.address,
            userOwnerUid: establishment?.userOwnerUid,
            coordinates: coordinatesString,
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

        // Tratar as coordenadas que estão armazenadas como string JSON
        let coordinates: Coord | null = null;
        if (rawEstablishment?.coordinates) {
            if (typeof rawEstablishment.coordinates === 'string') {
                try {
                    coordinates = JSON.parse(rawEstablishment.coordinates);
                } catch (error) {
                    console.warn('Erro ao fazer parse das coordenadas:', error);
                    console.warn('Coordenadas inválidas:', rawEstablishment.coordinates);
                    coordinates = null;
                }
            } else if (typeof rawEstablishment.coordinates === 'object') {
                coordinates = rawEstablishment.coordinates as unknown as Coord;
            }
        }

        return new Establishment({
            name: rawEstablishment?.name,
            address: rawEstablishment?.address,
            userOwnerUid: rawEstablishment?.userOwnerUid,
            coordinates: coordinates,
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