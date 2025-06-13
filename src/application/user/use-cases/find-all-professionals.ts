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
        // Obter todos os usuários
        const users = await this.userRepository.findAll();
        
        // Filtrar apenas usuários do tipo PROFESSIONAL
        const professionalUsers = users.filter(user => user.type === UserType.PROFESSIONAL);
        
        // Transformar no formato esperado pela interface
        const userData = professionalUsers.map(user => ({
            user,
            establishment: null // Estabelecimento será preenchido separadamente se necessário
        }));

        return { userData };
    }
}
