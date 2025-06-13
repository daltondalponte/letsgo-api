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
    type: 'PERSONAL' | 'PROFESSIONAL' | 'TICKETTAKER'
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
        const { email, name, type, document, password, avatar, isOwnerOfEstablishment, stripeAccountId } = request

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
            isActive: type === 'PROFESSIONAL' ? false : true,
            password
        })

        await this.userRepository.create(user)

        return { user }
    }
}