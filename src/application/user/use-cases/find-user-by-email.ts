import { Injectable } from "@nestjs/common";
import { User } from "../entity/User";
import { UserRepository } from "../repositories/user-repository";
import { Establishment } from "@application/establishment/entity/Establishment";

interface AccountRequest {
    email: string;
}

interface AccountResponse {
    user: User,
    establishment: Establishment
}

@Injectable()
export class FindUserByEmail {

    constructor(
        private userRepository: UserRepository
    ) { }

    async execute(request: AccountRequest): Promise<AccountResponse> {
        const { email } = request

        const data = await this.userRepository.findByEmail(email)

        return { user: data?.user, establishment: data?.establishment }
    }
}