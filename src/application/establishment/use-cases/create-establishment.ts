import { Injectable } from "@nestjs/common";
import { Coord, Establishment } from "../entity/Establishment";
import { EstablishmentRepository } from "../repositories/establishment-repository";


interface EstablishmentRequest {
    name: string;
    address: string,
    userOwnerUid: string,
    coordinates: Coord,
    photos?: string[]
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
        const { address, coordinates, name, photos, userOwnerUid } = request

        const establishment = new Establishment({
            address, coordinates, name, photos, userOwnerUid
        })

        await this.establishmentRepository.create(establishment)

        return { establishment }
    }
}