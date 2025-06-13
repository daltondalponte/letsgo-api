import { Injectable } from "@nestjs/common";
import { UserRepository } from "../repositories/user-repository";

interface AccountRequest {
    uid: string;
    deviceToken: string;
}

@Injectable()
export class SaveUserDeviceToken {

    constructor(
        private userRepository: UserRepository
    ) { }

    async execute(request: AccountRequest): Promise<void> {
        const { deviceToken, uid } = request

        await this.userRepository.save({ deviceToken, uid })

        return
    }
}