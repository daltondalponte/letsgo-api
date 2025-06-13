import { Injectable } from "@nestjs/common";
import { TicketTaker } from "../entity/TicketTaker";
import { TicketTakerRepository } from "../repository/ticket-taker-repository";
import { CreateUser } from "@application/user/use-cases/create-user";
import { randomBytes } from 'crypto';
import { MailerService } from "@infra/email/nodemailer/mail.service";
import { User } from "@application/user/entity/User";

interface TicketTackerRequest {
    userOwnerUid: string;
    email: string,
    name: string
}

interface TicketTackerResponse {
    user: User
}

@Injectable()
export class CreateTicketTaker {

    constructor(
        private createUser: CreateUser,
        private ticketTackerRepository: TicketTakerRepository,
        private mailService: MailerService
    ) { }

    async execute(request: TicketTackerRequest): Promise<TicketTackerResponse> {
        const { userOwnerUid, email, name } = request

        const buffer = randomBytes(Math.ceil(10 / 2));
        const password = buffer.toString('hex').slice(0, 10);

        const { user } = await this.createUser.execute({
            email,
            name,
            password,
            isOwnerOfEstablishment: false,
            type: "TICKETTAKER"
        })

        const ticketTaker = new TicketTaker({
            userOwnerUid, userTicketTakerUid: user.id
        })

        await this.ticketTackerRepository.create(ticketTaker)

        await this.mailService.sendEmailPassword(email, password)

        return { user }
    }
}