import { Controller, Get, Req, Post, UseGuards, Body, BadRequestException, Put, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { RefreshTokenGuard } from '../auth/guards/refresh-token.guard';
import { ApiTags, ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PasswordResetService } from '../auth/reset-password.service';
import { FacebookAuthGuard } from '../auth/guards/facebook-auth.guard';

// Define a DTO for the Google login request body
class GoogleLoginDto {
  idToken: string;
}

@ApiTags("Autenticação")
@Controller('user')
export class AuthController {

    constructor(
        private authService: AuthService,
        private passwordResetService: PasswordResetService,
        // Removed unused dependencies FindUserByEmail and CreateUser as they are handled within AuthService
    ) { }

    @UseGuards(LocalAuthGuard)
    @Post('auth/login')
    @ApiOperation({ 
        summary: 'Login com email e senha',
        description: 'Realiza autenticação do usuário usando email e senha. Retorna tokens JWT para acesso à API.'
    })
    @ApiBody({ 
        schema: { 
            type: 'object',
            properties: { 
                username: { 
                    type: 'string',
                    description: 'Email do usuário',
                    example: 'joao@email.com'
                }, 
                password: { 
                    type: 'string',
                    description: 'Senha do usuário',
                    example: 'senha123'
                } 
            },
            required: ['username', 'password']
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Login realizado com sucesso',
        schema: {
            type: 'object',
            properties: {
                access_token: { type: 'string', description: 'Token de acesso JWT' },
                refresh_token: { type: 'string', description: 'Token de renovação JWT' },
                user: { type: 'object', description: 'Dados do usuário autenticado' }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
    async login(@Req() req) {
        // User object is attached by LocalAuthGuard/LocalStrategy
        return this.authService.login(req.user);
    }

    @Post('auth/google-login')
    @ApiOperation({ 
        summary: 'Login com Google',
        description: 'Realiza autenticação do usuário usando token ID do Google. Cria conta automaticamente se não existir.'
    })
    @ApiBody({ 
        type: GoogleLoginDto,
        description: 'Token ID do Google',
        examples: {
            googleToken: {
                summary: 'Google ID Token',
                value: { idToken: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1Njc4OTAiLCJ0eXAiOiJKV1QifQ...' }
            }
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Login realizado com sucesso',
        schema: {
            type: 'object',
            properties: {
                access_token: { type: 'string', description: 'Token de acesso JWT' },
                refresh_token: { type: 'string', description: 'Token de renovação JWT' },
                user: { type: 'object', description: 'Dados do usuário autenticado' }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Token do Google inválido' })
    async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
        // Verify the idToken and get user details
        const user = await this.authService.verifyGoogleIdToken(googleLoginDto.idToken);
        // If verification is successful, proceed to login the user and return JWT tokens
        return this.authService.login(user);
    }

    @UseGuards(FacebookAuthGuard)
    @Post('auth/facebook-login')
    @ApiOperation({ 
        summary: 'Login com Facebook',
        description: 'Realiza autenticação do usuário usando access token do Facebook. Cria conta automaticamente se não existir.'
    })
    @ApiBody({ 
        schema: { 
            type: 'object',
            properties: { 
                access_token: { 
                    type: 'string',
                    description: 'Access token do Facebook',
                    example: 'EAABwzLixnjYBO...'
                } 
            },
            required: ['access_token']
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Login realizado com sucesso',
        schema: {
            type: 'object',
            properties: {
                access_token: { type: 'string', description: 'Token de acesso JWT' },
                refresh_token: { type: 'string', description: 'Token de renovação JWT' },
                user: { type: 'object', description: 'Dados do usuário autenticado' }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Token do Facebook inválido' })
    async facebookLogin(@Req() req) {
        // User object is attached by FacebookAuthGuard/FacebookStrategy
        // The strategy handles token verification and user lookup/creation
        return this.authService.login(req.user); // Return JWT tokens
    }

    @Post("reset-password")
    @ApiOperation({ 
        summary: 'Solicitar reset de senha',
        description: 'Envia email com link para redefinição de senha. O usuário receberá um token único por email.'
    })
    @ApiBody({ 
        schema: { 
            type: 'object',
            properties: { 
                email: { 
                    type: 'string',
                    description: 'Email do usuário',
                    example: 'joao@email.com',
                    format: 'email'
                } 
            },
            required: ['email']
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Email de reset enviado com sucesso',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Email enviado com sucesso' }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Email inválido ou usuário não encontrado' })
    async resetPassword(@Body('email') email: string) {
        await this.passwordResetService.sendResetEmail(email);
        return { message: 'Email enviado com sucesso' };
    }

    @Get("verify-token")
    @ApiOperation({ 
        summary: 'Verificar token de reset',
        description: 'Verifica se o token de reset de senha é válido. Usado para validar o link enviado por email.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Token válido',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'sucesso' }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Token inválido ou expirado' })
    async verifyToken(@Req() req) {
        const { email, resetToken } = req.query;
        const isValidToken = await this.passwordResetService.verifyResetToken(email, resetToken);

        if (!isValidToken) throw new UnauthorizedException("Não permitido");

        return { message: 'sucesso' };
    }

    @Put("update-password")
    @ApiOperation({ 
        summary: 'Atualizar senha',
        description: 'Atualiza a senha do usuário usando o token de reset. Deve ser chamado após verificar o token.'
    })
    @ApiBody({ 
        schema: { 
            type: 'object',
            properties: { 
                email: { 
                    type: 'string',
                    description: 'Email do usuário',
                    example: 'joao@email.com',
                    format: 'email'
                }, 
                password: { 
                    type: 'string',
                    description: 'Nova senha (mínimo 8 caracteres)',
                    example: 'novaSenha123',
                    minLength: 8
                }, 
                resetToken: { 
                    type: 'string',
                    description: 'Token de reset recebido por email',
                    example: 'abc123def456...'
                } 
            },
            required: ['email', 'password', 'resetToken']
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Senha atualizada com sucesso',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Sucesso' }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Token inválido ou expirado' })
    @ApiResponse({ status: 400, description: 'Dados inválidos' })
    async updatePassword(@Body() body: { resetToken: string, email: string, password: string }) {
        const { email, resetToken, password } = body;

        const isValidToken = await this.passwordResetService.verifyResetToken(email, resetToken);

        if (!isValidToken) {
            throw new UnauthorizedException("Não permitido");
        }

        await this.passwordResetService.resetPassword(email, password);
        return { message: 'Sucesso' };
    }

    @UseGuards(RefreshTokenGuard)
    @ApiBearerAuth()
    @Get('auth/refresh-token')
    @ApiOperation({ 
        summary: 'Renovar tokens',
        description: 'Renova os tokens de acesso usando o refresh token. Útil quando o access token expira.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Tokens renovados com sucesso',
        schema: {
            type: 'object',
            properties: {
                access_token: { type: 'string', description: 'Novo token de acesso JWT' },
                refresh_token: { type: 'string', description: 'Novo token de renovação JWT' }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Refresh token inválido ou expirado' })
    refreshTokens(@Req() req) {
        const user = req.user; // User should contain id and email from RefreshTokenStrategy
        const refreshToken = req.headers.authorization.replace('Bearer ', ''); // Extract refresh token
        return this.authService.refreshTokens(user.uid, refreshToken);
    }

    @Get("auth/session")
    @ApiOperation({ 
        summary: 'Verificar sessão',
        description: 'Verifica se existe uma sessão ativa e retorna os dados do usuário autenticado.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Sessão ativa',
        schema: {
            type: 'object',
            properties: {
                user: { type: 'object', description: 'Dados do usuário autenticado' }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Nenhuma sessão ativa' })
    async getSession(@Req() req) {
        if (req.user) {
            return { user: req.user }; 
        } else {
            throw new UnauthorizedException("Nenhuma sessão ativa");
        }
    }

    @Get("auth/providers")
    @ApiOperation({ 
        summary: 'Listar provedores de autenticação',
        description: 'Retorna a lista de provedores de autenticação disponíveis (Google e Facebook).'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Provedores disponíveis',
        schema: {
            type: 'object',
            properties: {
                google: { 
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'google' },
                        name: { type: 'string', example: 'Google' },
                        type: { type: 'string', example: 'oauth' }
                    }
                },
                facebook: { 
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'facebook' },
                        name: { type: 'string', example: 'Facebook' },
                        type: { type: 'string', example: 'oauth' }
                    }
                }
            }
        }
    })
    async getProviders() {
        return {
            google: { id: "google", name: "Google", type: "oauth" },
            facebook: { id: "facebook", name: "Facebook", type: "oauth" },
        };
    }

    @Post("auth/_log")
    async logEvent(@Body() body: any) {
        console.log("NextAuth.js Log Event:", body);
        return { success: true }; 
    }

}


