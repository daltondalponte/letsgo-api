import { Injectable } from "@nestjs/common";
import { User } from "../entity/User";
import { UserRepository } from "../repositories/user-repository";
import { Establishment } from "@application/establishment/entity/Establishment";

interface AccountRequest {
    id: string;
}

interface AccountResponse {
    user: User,
    establishment: Establishment
}

@Injectable()
export class FindUserById {

    constructor(
        private userRepository: UserRepository
    ) { }

    async execute(request: AccountRequest): Promise<AccountResponse> {
        const { id } = request

        const { user, establishment } = await this.userRepository.findById(id)

        return { user, establishment }
    }
}