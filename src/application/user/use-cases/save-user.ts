import { Injectable } from "@nestjs/common";
import { UserRepository } from "../repositories/user-repository";

interface AccountRequest {
    uid: string;
    name: string;
    document?: string;
    avatar?: string;
}


@Injectable()
export class SaveUser {

    constructor(
        private userRepository: UserRepository
    ) { }

    async execute(request: AccountRequest): Promise<void> {
        const { name, document, avatar, uid } = request

        await this.userRepository.save({ name, document, avatar, uid })

        return
    }
}