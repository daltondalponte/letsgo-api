import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

@Injectable()
export class FirebaseService {
    private firebaseApp: admin.app.App;

    constructor() { }

    async createApp() {
        try {
            // Tentativa de importar o certificado dinamicamente
            let credential;
            try {
                // Tenta importar o certificado se existir
                const LetsGoCert = require('../../../../lets-go-firebase-admin.json');
                credential = admin.credential.cert(LetsGoCert as admin.ServiceAccount);
            } catch (error) {
                // Fallback para credenciais de ambiente ou aplicação padrão
                console.warn('Arquivo de certificado Firebase não encontrado, usando credenciais alternativas');
                credential = admin.credential.applicationDefault();
            }

            this.firebaseApp = admin.initializeApp({
                credential,
                databaseURL: "https://lets-go-c35be.firebaseio.com",
            });
        } catch (error) {
            console.error('Erro ao inicializar Firebase:', error);
        }
    }

    async firestoreMakeAnUpdate(ref: string, data: { [x: string]: string }) {
        this.createApp()
        try {
            await this.firebaseApp.firestore().collection(ref).add(data)
        } catch (e) {
            console.log(e);

        } finally {
            this.closeApp()
        }

    }

    async sendNotification(title: string, body: string, deviceToken: string, navigateTo?: string) {
        this.createApp()
        try {
            const message = {
                data: {
                    title,
                    body,
                    navigateTo
                },
                token: deviceToken
            }

            const messaging = this.firebaseApp.messaging()

            await messaging.send(message)
        } catch (e) {
            throw new BadRequestException(e)
        } finally {
            this.closeApp()
        }

    }

    async createUser(email: string, password: string): Promise<admin.auth.UserRecord> {
        this.createApp()
        try {
            const user = await this.firebaseApp.auth().createUser({
                email,
                password
            })
            return user;
        } catch (e) {
            throw new BadRequestException(e)
        } finally {
            this.closeApp()
        }

    }

    async generateToken(uid: string): Promise<string> {
        this.createApp()
        try {
            return await this.firebaseApp.auth().createCustomToken(uid)
        } catch (e) {
            throw new Error(e)
        } finally {
            this.closeApp()
        }
    }

    async verifyToken(token: string): Promise<DecodedIdToken> {
        this.createApp()
        try {
            return await this.firebaseApp.auth().verifyIdToken(token)
        } catch (e) {
            console.log(e);

            throw new UnauthorizedException("Acesso negado!")
        } finally {
            this.closeApp()
        }
    }

    async closeApp(): Promise<void> {
        await this.firebaseApp.delete();
        this.firebaseApp = null
    }

}
