import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from "bcrypt";
import { User, AccountRole } from '@application/user/entity/User';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '@application/user/repositories/user-repository';
import { UserViewModel } from '../view-models/user/user-view-model';
import { EstablishmentViewModel } from '../view-models/establishment/establishment-view-model';
import { StripeService } from '@infra/payment/stripe.service';
import Stripe from 'stripe';
import { CreateUser } from '@application/user/use-cases/create-user';
import { randomUUID } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

// <-- ADICIONADA INTERFACE
interface IFacebookUser {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

@Injectable() 
export class AuthService {
    private googleClient: OAuth2Client;

    constructor(
        private userRepository: UserRepository,
        private jwtService: JwtService,
        private stripeService: StripeService,
        private configService: ConfigService,
        private createUserUseCase: CreateUser,
        private httpService: HttpService
    )  {
        this.googleClient = new OAuth2Client(this.configService.get<string>('GOOGLE_CLIENT_ID'));
    }
    
    
    async validateUser(email: string, pass: string): Promise<any> {
    console.log(`[AuthService] Tentativa de login para o email: ${email}`);

    const result = await this.userRepository.findByEmail(email);

if (!result || !result.user) {
    return null; // User not found or invalid result
}

const { user, establishment } = result;

    if (!user) {
        console.log(`[AuthService] Usuário não encontrado para o email: ${email}`);
        return null; // User not found
    }

    console.log(`[AuthService] Usuário encontrado: ${user.email}`);
    // CUIDADO: Não logue a senha em texto puro em produção. Apenas para depuração.
    // console.log(`[AuthService] Senha fornecida (texto puro): ${pass}`); 
    console.log(`[AuthService] Hash da senha no banco: ${user.password}`);

    const passwordMatch = await bcrypt.compare(pass, user.password);

    if (passwordMatch) {
        console.log(`[AuthService] Senha corresponde! Login bem-sucedido para: ${user.email}`);
        return user;
    } else {
        console.log(`[AuthService] Senha NÃO corresponde para o email: ${user.email}`);
        return null; // Password doesn't match
    }
  }


    async verifyGoogleIdToken(idToken: string): Promise<User> {
        // ... (código existente de verifyGoogleIdToken)
        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken: idToken,
                audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
            });
            const payload = ticket.getPayload();
            if (!payload) {
                throw new UnauthorizedException('Token do Google inválido.');
            }

            const { sub: googleId, email, name, picture: avatar } = payload;

            if (!email) {
                throw new BadRequestException('Token do Google não contém email.');
            }

            return await this.validateOAuthLogin(googleId, 'google', email, name || 'Usuário Google', avatar);

        } catch (error) {
            console.error('Erro ao verificar Google ID Token:', error);
            if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Falha ao validar token do Google.');
        }
    }

    async validateOAuthLogin(
        providerId: string,
        provider: 'facebook' | 'google',
        email: string,
        name: string,
        avatar?: string
    ): Promise<User> {
        // ... (código existente de validateOAuthLogin)
        try {
            let user: User | null = null;
            const existingUserResult = await this.userRepository.findByEmail(email);
            if (existingUserResult?.user) {
                user = existingUserResult.user;
            } else {
                console.log(`Creating new user via ${provider} OAuth for email: ${email}`);
                const newUserResult = await this.createUserUseCase.execute({
                    email: email,
                    name: name,
                    password: randomUUID(),
                    avatar: avatar,
                    type: 'PERSONAL',
                });
                user = newUserResult.user;
            }

            if (!user) {
                throw new InternalServerErrorException('Não foi possível encontrar ou criar o usuário.');
            }

            return user;
        } catch (error) {
            console.error(`Error during OAuth validation (${provider}):`, error);
            throw new InternalServerErrorException('Erro durante a validação OAuth.');
        }
    }

    // <-- ADICIONADA FUNÇÃO facebookLogin COMPLETA -->
    async facebookLogin(accessToken: string): Promise<any> {
        console.log(
          "--- [AuthService] facebookLogin initiated ---",
        );
        try {
          const facebookAppId = this.configService.get<string>("FACEBOOK_APP_ID");
          const facebookAppSecret = this.configService.get<string>(
            "FACEBOOK_APP_SECRET",
          );
          console.log(
            "[AuthService] facebookLogin: Received access token (first 10 chars):",
            accessToken.substring(0, 10),
          );
          console.log(
            "[AuthService] facebookLogin: Using App ID:",
            facebookAppId,
          );

          console.log(
            "[AuthService] facebookLogin: Verifying access token with Facebook...",
          );
          const debugTokenUrl = `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${facebookAppId}|${facebookAppSecret}`;
          console.log(
            "[AuthService] facebookLogin: Calling Debug Token URL:",
            debugTokenUrl.replace(accessToken, "[TOKEN_HIDDEN]") ,
          );
          const debugResponse: AxiosResponse<any> = await firstValueFrom(
            this.httpService.get(debugTokenUrl) 
          );
          console.log(
            "[AuthService] facebookLogin: Debug token response received.",
          );

          if (
            !debugResponse.data?.data?.is_valid ||
            debugResponse.data?.data?.app_id !== facebookAppId
          ) {
            console.error(
              "[AuthService] facebookLogin: Invalid Facebook access token.",
              debugResponse.data?.data,
            );
            throw new UnauthorizedException(
              "Token de acesso do Facebook inválido.",
            );
          }
          const userId = debugResponse.data.data.user_id;
          console.log(
            "[AuthService] facebookLogin: Token is valid for user ID:",
            userId,
          );

          // 2. Get user profile information from Facebook
          console.log(
            "[AuthService] facebookLogin: Fetching user profile from Facebook...",
          );
          const profileUrl = `https://graph.facebook.com/${userId}?fields=id,name,email,picture&access_token=${accessToken}`;
          console.log(
            "[AuthService] facebookLogin: Calling Profile URL:",
            profileUrl.replace(accessToken, "[TOKEN_HIDDEN]") ,
          );
          const profileResponse: AxiosResponse<IFacebookUser> = await firstValueFrom(
            this.httpService.get(profileUrl) 
          );
          const fbUser = profileResponse.data;
          console.log(
            "[AuthService] facebookLogin: User profile received:",
            fbUser ? fbUser.email || fbUser.id : "[NO FB USER DATA]",
          );

          if (!fbUser || !fbUser.id) {
            console.error(
              "[AuthService] facebookLogin: Failed to fetch Facebook user profile.",
            );
            throw new UnauthorizedException(
              "Falha ao obter informações do usuário do Facebook.",
            );
          }

          const userEmail = fbUser.email;
          if (!userEmail) {
            console.error(
              "[AuthService] facebookLogin: Facebook user does not have an email address.",
            );
            throw new UnauthorizedException(
              "Conta do Facebook não possui um endereço de e-mail associado.",
            );
          }

          console.log(
            "[AuthService] facebookLogin: Calling validateOAuthLogin for email:",
            userEmail,
          );
          const user: User = await this.validateOAuthLogin(
            fbUser.id,
            'facebook',
            userEmail,
            fbUser.name,
            fbUser.picture?.data?.url
          );

          console.log(
            "[AuthService] facebookLogin: Proceeding to generate tokens for user:",
            user.uid,
          );
          return this.login(user);

        } catch (error) {
          console.error(
            "[AuthService] facebookLogin: Error during Facebook login:",
            error.response?.data || error.message || error,
          );
          if (error instanceof HttpException) {
            throw error;
          }
          throw new UnauthorizedException("Falha na autenticação com Facebook.");
        }
      }

    async login(user: User) {
        // ... (código existente de login)
        try {
            if (!user || !user.uid) {
                throw new BadRequestException("Dados de usuário inválidos para login.");
            }

            const tokens = await this.getTokens(user.uid, user.email, user.type);
            const refreshTokenExists = await this.userRepository.findRefreshTokenByUserId(user.uid);

            let stripeCustomerId: string | null = user.stripeCustomerId;
            let stripeAccount: Stripe.Response<Stripe.Account> | null = null;
            let charges_enabled: boolean | null = null;

            if (user.type === 'PROFESSIONAL') {
                if (user.stripeAccountId) {
                    try {
                        stripeAccount = await this.stripeService.retrieveAccount(user.stripeAccountId);
                        charges_enabled = stripeAccount?.charges_enabled ?? null;
                    } catch (error) {
                        console.error("Error retrieving Stripe account:", error);
                        stripeAccount = null;
                    }
                }
                if (!stripeAccount) { 
                    try {
                        stripeAccount = await this.stripeService.createConnectAccount(user.email);
                        if (stripeAccount) {
                            await this.userRepository.save({ uid: user.uid, stripeAccountId: stripeAccount.id });
                            charges_enabled = stripeAccount.charges_enabled;
                        }
                    } catch (error) {
                        console.error("Error creating Stripe connect account:", error);
                    }
                }
            }

            if (user.type === 'PERSONAL' && !stripeCustomerId) {
                try {
                    stripeCustomerId = await this.stripeService.createCustomer(user);
                    if (stripeCustomerId) {
                        await this.userRepository.save({ uid: user.uid, stripeCustomerId });
                    }
                } catch (error) {
                    console.error("Error creating Stripe customer:", error);
                }
            }

            const hashedRefreshToken = await this.hashData(tokens.refreshToken);
            if (!refreshTokenExists) {
                await this.userRepository.createRefreshToken(user.uid, hashedRefreshToken);
            } else {
                await this.userRepository.updateRefreshToken(user.uid, hashedRefreshToken);
            }

            let establishmentDetails = null;
            if (user.type === 'PROFESSIONAL') {
                 const { establishment } = await this.userRepository.findByEmail(user.email);
                 if (establishment) {
                     establishmentDetails = EstablishmentViewModel.toHTTP(establishment);
                 }
            }

            const userResponse = {
                ...UserViewModel.toHTTP(user),
                stripeAccountId: user.stripeAccountId,
                stripeCustomerId: stripeCustomerId ?? user.stripeCustomerId,
                establishment: establishmentDetails
            };

            return {
                user: userResponse,
                charges_enabled: charges_enabled,
                access_token: tokens.accessToken,
                refresh_token: tokens.refreshToken
            };
        } catch (error) {
            console.error("Error during login process:", error);
            if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException("Ocorreu um erro interno durante o login.");
        }
    }

    hashData(data: string) {
        // ... (código existente de hashData)
        return bcrypt.hash(data, 10);
    }

    async refreshTokens(userId: string, refreshToken: string) {
        // ... (código existente de refreshTokens)
        const hashedRefreshTokenFromDb = await this.userRepository.findRefreshTokenByUserId(userId);

        if (!hashedRefreshTokenFromDb) throw new ForbiddenException('Acesso negado - Token não encontrado');

        const refreshTokenMatches = await bcrypt.compare(
            refreshToken,
            hashedRefreshTokenFromDb
        );

        if (!refreshTokenMatches) {
            throw new ForbiddenException('Acesso negado - Token inválido');
        }

        const { user } = await this.userRepository.findById(userId);
        if (!user) {
             throw new ForbiddenException('Acesso negado - Usuário não encontrado');
        }

        const tokens = await this.getTokens(user.uid, user.email, user.type);
        const newHashedRefreshToken = await this.hashData(tokens.refreshToken);
        await this.userRepository.updateRefreshToken(userId, newHashedRefreshToken);
        
        return tokens;
    }

    async getTokens(userId: string, username: string, userRole: string) {
        // ... (código existente de getTokens)
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                {
                    sub: userId,
                    username,
                    role: userRole
                },
                {
                    secret: this.configService.get<string>('JWT_SECRET'),
                    expiresIn: '1h',
                },
            ),
            this.jwtService.signAsync(
                {
                    sub: userId,
                    username,
                },
                {
                    secret: this.configService.get<string>('JWT_SECRET_REFRESH_TOKEN'),
                    expiresIn: '7d',
                },
            ),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }
}


