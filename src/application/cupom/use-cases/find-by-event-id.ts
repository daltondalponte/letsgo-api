import { Injectable } from "@nestjs/common";
import { Cupom } from "../entity/Cupom";
import { CupomRepository } from "../repositories/cupom-repository";

interface CupomRequest {
    eventId: string;
}

interface CupomResponse {
    cupons: Cupom[]
}

@Injectable()
export class FindCuponsByEventId {

    constructor(
        private cupomRepository: CupomRepository
    ) { }

    async execute(request: CupomRequest): Promise<CupomResponse> {
        const { eventId } = request

        const cupons = await this.cupomRepository.findManyByEventId(eventId)

        return { cupons }
    }
}