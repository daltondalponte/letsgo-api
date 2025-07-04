import { BadRequestException, Injectable } from "@nestjs/common";
import { User } from "../entity/User";
import { UserRepository } from "../repositories/user-repository";

interface AccountRequest {
    name: string;
    email: string;
    password: string;
    document?: string;
    address?: string;
    avatar?: string;
    isOwnerOfEstablishment?: boolean;
    stripeAccountId?: string;
    phone?: string;
    birthDate?: Date;
    type: 'PERSONAL' | 'PROFESSIONAL_OWNER' | 'PROFESSIONAL_PROMOTER' | 'TICKETTAKER'
}

interface AccountResponse {
    user: User
}

@Injectable()
export class CreateUser {

    constructor(
        private userRepository: UserRepository
    ) { }

    async execute(request: AccountRequest): Promise<AccountResponse> {
        const { email, name, type, document, password, avatar, isOwnerOfEstablishment, stripeAccountId, phone, birthDate } = request

        const userAlreadyExists = await this.userRepository.findByEmail(email)

        if (userAlreadyExists) {
            throw new BadRequestException('Endereço de email já cadastrado.')
        }

        const user = new User({
            email,
            name,
            type,
            document,
            avatar,
            stripeAccountId,
            isOwnerOfEstablishment,
            phone,
            birthDate,
            isActive: type === 'PROFESSIONAL_OWNER' || type === 'PROFESSIONAL_PROMOTER' ? false : true,
            password
        })

        await this.userRepository.create(user)

        return { user }
    }
}