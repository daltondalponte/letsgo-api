import { Injectable } from "@nestjs/common";
import { UserRepository } from "../repositories/user-repository";

interface AccountRequest {
    uid: string;
    data: any
}


@Injectable()
export class UpdateProfessional {

    constructor(
        private userRepository: UserRepository
    ) { }

    async execute(request: AccountRequest): Promise<any> {
        const { data, uid } = request
        return await this.userRepository.save({ ...data, uid })
    }
}
