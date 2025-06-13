import { Injectable } from "@nestjs/common";
import { EstablishmentRepository } from "../repositories/establishment-repository";
import { Establishment } from "../entity/Establishment";

interface EstablishmentRequest {
    useruid: string;
}

interface EstablishmentResponse {
    establishment: Establishment
}

@Injectable()
export class FindEstablishmentByUserUid {

    constructor(
        private establishmentRepository: EstablishmentRepository
    ) { }

    async execute(request: EstablishmentRequest): Promise<EstablishmentResponse> {
        const { useruid } = request

        const establishment = await this.establishmentRepository.findByUserUid(useruid)

        return { establishment }
    }
}