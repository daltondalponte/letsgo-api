import { Injectable } from "@nestjs/common";
import { AccountRole, User } from "../entity/User";
import { UserRepository } from "../repositories/user-repository";
import { PrismaUserMapper } from "@infra/database/prisma/mappers/user/prisma-user-mapper";

interface AccountRequest {
    id: string;
    name: string;
    email: string;
}

@Injectable()
export class UpdateUSer {

    constructor(
        private userRepository: UserRepository
    ) { }

    async execute(request: AccountRequest): Promise<void> {
        const { email, name, id } = request

        const { user } = await this.userRepository.findById(id)

        const editedUser = new User({
            email,
            name,
            type: user?.type as AccountRole,
            document: user?.document,
            avatar: user?.avatar,
            isOwnerOfEstablishment: user?.isOwnerOfEstablishment,
            isActive: user?.isActive,
            password: user?.password
        }, user?.id)

        const rawUser = PrismaUserMapper.toPrisma(editedUser)

        await this.userRepository.save(rawUser)
    }
}