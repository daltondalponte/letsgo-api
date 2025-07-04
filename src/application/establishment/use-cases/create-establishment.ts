import { Injectable } from "@nestjs/common";
import { Coord, Establishment } from "../entity/Establishment";
import { EstablishmentRepository } from "../repositories/establishment-repository";


interface EstablishmentRequest {
    name: string;
    address: string,
    userOwnerUid: string,
    coordinates: Coord,
    photos?: string[],
    description?: string,
    contactPhone?: string,
    website?: string,
    socialMedia?: any
}

interface EstablishmentResponse {
    establishment: Establishment
}

@Injectable()
export class CreateEstablishment {

    constructor(
        private establishmentRepository: EstablishmentRepository
    ) { }

    async execute(request: EstablishmentRequest): Promise<EstablishmentResponse> {
        const { address, coordinates, name, photos, userOwnerUid, description, contactPhone, website, socialMedia } = request

        const establishment = new Establishment({
            address, coordinates, name, photos, userOwnerUid, description, contactPhone, website, socialMedia
        })

        await this.establishmentRepository.create(establishment)

        return { establishment }
    }
}