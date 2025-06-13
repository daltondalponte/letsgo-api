import { Injectable } from "@nestjs/common";
import { EstablishmentRepository } from "../repositories/establishment-repository";
import { Establishment } from "../entity/Establishment";


interface EstablishmentResponse {
    establishments: Establishment[]
}

@Injectable()
export class FindAllEstablishments {

    constructor(
        private establishmentRepository: EstablishmentRepository
    ) { }

    async execute(): Promise<EstablishmentResponse> {

        const establishments = await this.establishmentRepository.find()

        return { establishments }
    }
}