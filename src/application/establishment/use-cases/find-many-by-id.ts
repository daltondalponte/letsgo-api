import { Injectable } from "@nestjs/common";
import { EstablishmentRepository } from "../repositories/establishment-repository";
import { Establishment } from "../entity/Establishment";

interface EstablishmentRequest {
    id: string;
}

interface EstablishmentResponse {
    establishment: Establishment
    userOwner: any
}

@Injectable()
export class FindEstablishmentById {

    constructor(
        private establishmentRepository: EstablishmentRepository
    ) { }

    async execute(request: EstablishmentRequest): Promise<EstablishmentResponse> {
        const { id } = request

        const { establishment, userOwner } = await this.establishmentRepository.findById(id)

        return { establishment, userOwner }
    }
}