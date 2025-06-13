import { Injectable } from "@nestjs/common";
import { UserRepository } from "../repositories/user-repository";

interface AccountRequest {
    id: string;
}


@Injectable()
export class DeleteUserById {

    constructor(
        private userRepository: UserRepository
    ) { }

    async execute(request: AccountRequest): Promise<void> {
        const { id } = request
        await this.userRepository.delete(id)
    }
}