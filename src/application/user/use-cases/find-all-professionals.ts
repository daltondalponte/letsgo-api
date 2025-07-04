import { Injectable } from "@nestjs/common";
import { User } from "../entity/User";
import { UserRepository } from "../repositories/user-repository";
import { Establishment } from "@application/establishment/entity/Establishment";
import { UserType } from "@prisma/client";

interface AccountResponse {
    userData: {
        user: User,
        establishment: Establishment | null
    }[]
}

@Injectable()
export class FindAllProfessionals {

    constructor(
        private userRepository: UserRepository
    ) { }

    async execute(): Promise<AccountResponse> {
        // Obter todos os usuários com estabelecimentos
        const { userData } = await this.userRepository.findAllWithEstablishments();
        
        // Filtrar apenas usuários do tipo PROFESSIONAL_OWNER e PROFESSIONAL_PROMOTER
        const professionalUsers = userData.filter(data => 
            data.user.type === UserType.PROFESSIONAL_OWNER || data.user.type === UserType.PROFESSIONAL_PROMOTER
        );

        return { userData: professionalUsers };
    }
}
