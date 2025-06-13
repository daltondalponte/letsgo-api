import { BadRequestException, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      // Configurações do serviço de e-mail
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: 'oliveira.contato23@gmail.com',
        pass: 'Ns7LGZXR1mdqSVrH'
      },
    });
  }

  async sendEmailPassword(to: string, pass: string): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: 'contato@letsgo.app.br',
      to: to,
      subject: 'Sua senha de acesso',
      text: `Sua senha de acesso para autenticar no app letsgo: ${pass}`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendEmailToken(to: string, token: string): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: 'contato@letsgo.app.br',
      to: to,
      subject: 'Redefinição de senha',
      text: `Seu código para redefinir sua senha: ${token}\nNão compartilhe este coódigo com ninguém.`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw new BadRequestException('Failed to send email');
    }
  }
}
