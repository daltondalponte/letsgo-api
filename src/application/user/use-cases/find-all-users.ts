import { Injectable } from "@nestjs/common";
import { UserRepository } from "@application/user/repositories/user-repository";

interface FindAllUsersResponse {
    users: any[];
}

@Injectable()
export class FindAllUsers {
    constructor(private userRepository: UserRepository) {}

    async execute(): Promise<FindAllUsersResponse> {
        const users = await this.userRepository.findAll();
        
        return {
            users
        };
    }
}
