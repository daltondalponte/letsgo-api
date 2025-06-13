import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Coord, Establishment } from "../entity/Establishment";
import { EstablishmentRepository } from "../repositories/establishment-repository";


interface EstablishmentRequest {
    id: string;
    userOwnerUid: string,
    photos?: string[]
}

@Injectable()
export class UpdateEstablishmentPhoto {

    constructor(
        private establishmentRepository: EstablishmentRepository
    ) { }

    async execute(request: EstablishmentRequest): Promise<void> {
        const { id, photos, userOwnerUid } = request

        const { establishment } = await this.establishmentRepository.findById(id)
        if (establishment.userOwnerUid !== userOwnerUid) throw new UnauthorizedException("Não permitido!")

        const newEstablishment = new Establishment({
            address: establishment.address,
            coordinates: establishment.coord,
            name: establishment.name,
            photos,
            createdAt: establishment.createdAt,
            userOwnerUid
        }, establishment.id)

        await this.establishmentRepository.save(newEstablishment)

    }
}