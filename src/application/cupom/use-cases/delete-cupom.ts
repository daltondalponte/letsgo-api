import { Injectable, BadRequestException } from "@nestjs/common";
import { CupomRepository } from "../repositories/cupom-repository";

interface DeleteCupomRequest {
    id: string;
}

@Injectable()
export class DeleteCupom {

    constructor(
        private cupomRepository: CupomRepository
    ) { }

    async execute(request: DeleteCupomRequest): Promise<void> {
        const { id } = request

        const cupom = await this.cupomRepository.findById(id)

        if (!cupom) {
            throw new BadRequestException("Cupom não encontrado")
        }

        await this.cupomRepository.delete(id)
    }
} 