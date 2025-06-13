import { UserRepository } from '@application/user/repositories/user-repository';
import { MailerService } from '@infra/email/nodemailer/mail.service';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordResetService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly mailerService: MailerService,
    ) { }

    async verifyResetToken(email: string, token: string): Promise<boolean> {
        const { user } = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new Error('User not found');
        }

        const isTokenValid = await this.compareTokens(token, user.resetToken);

        return isTokenValid;
    }

    async resetPassword(email: string, newPassword: string): Promise<void> {
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await this.userRepository.save({ email, password: hashedPassword, resetToken: null });
    }


    async sendResetEmail(email: string) {
        // Verifique se o e-mail existe no banco de dados
        const { user } = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }

        // Crie um token seguro para a troca de senha
        const resetToken = await this.generateResetToken();

        // Armazene o hash do token no banco de dados associado ao usuário
        await this.userRepository.saveResetToken(user.uid, await this.hashToken(resetToken));

        // Envie um e-mail contendo o link para redefinição de senha
        await this.mailerService.sendEmailToken(user.email, resetToken)
    }

    private async compareTokens(token: string, hashedToken: string): Promise<boolean> {

        const tokenMatch = await bcrypt.compare(token, hashedToken)
        if (tokenMatch) return true

        return false
    }

    private async hashToken(token: string): Promise<string> {
        const saltRounds = 10;
        const hashedToken = await bcrypt.hash(token, saltRounds);
        return hashedToken;
    }

    private async generateResetToken(): Promise<string> {
        let length = 6
        const characters = '0123456789';
        let token = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            token += characters[randomIndex];
        }

        return token;
    }
}
