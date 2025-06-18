import { Controller, Get, Req, Post, UseGuards, Body, BadRequestException, Put, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { RefreshTokenGuard } from '../auth/guards/refresh-token.guard';
import { ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger'; // Import ApiBearerAuth and ApiBody
import { PasswordResetService } from '../auth/reset-password.service';
import { FacebookAuthGuard } from '../auth/guards/facebook-auth.guard'; // Import FacebookAuthGuard

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
    @ApiBody({ schema: { properties: { username: { type: 'string' }, password: { type: 'string' } } } }) // Add Swagger body definition
    async login(@Req() req) {
        // User object is attached by LocalAuthGuard/LocalStrategy
        return this.authService.login(req.user);
    }

    // Endpoint for Google Login (validates idToken via AuthService)
    @Post('auth/google-login')
    @ApiBody({ type: GoogleLoginDto }) // Body expects Google idToken
    async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
        // Verify the idToken and get user details
        const user = await this.authService.verifyGoogleIdToken(googleLoginDto.idToken);
        // If verification is successful, proceed to login the user and return JWT tokens
        return this.authService.login(user);
    }

    // Endpoint for Facebook Login (using a dedicated guard)
    @UseGuards(FacebookAuthGuard) // Use the FacebookAuthGuard
    @Post('auth/facebook-login')
    @ApiBody({ schema: { properties: { access_token: { type: 'string' } } } }) // Body expects Facebook access token
    async facebookLogin(@Req() req) {
        // User object is attached by FacebookAuthGuard/FacebookStrategy
        // The strategy handles token verification and user lookup/creation
        return this.authService.login(req.user); // Return JWT tokens
    }

    @Post("reset-password")
    @ApiBody({ schema: { properties: { email: { type: 'string' } } } })
    async resetPassword(@Body('email') email: string) {
        await this.passwordResetService.sendResetEmail(email);
        return { message: 'Email enviado com sucesso' };
    }

    @Get("verify-token")
    async verifyToken(@Req() req) {
        const { email, resetToken } = req.query;
        const isValidToken = await this.passwordResetService.verifyResetToken(email, resetToken);

        if (!isValidToken) throw new UnauthorizedException("Não permitido");

        return { message: 'sucesso' };
    }

    @Put("update-password")
    @ApiBody({ schema: { properties: { email: { type: 'string' }, password: { type: 'string' }, resetToken: { type: 'string' } } } })
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
    @ApiBearerAuth() // Indicate that this endpoint requires a bearer token (refresh token)
    @Get('auth/refresh-token')
    refreshTokens(@Req() req) {
        const user = req.user; // User should contain id and email from RefreshTokenStrategy
        const refreshToken = req.headers.authorization.replace('Bearer ', ''); // Extract refresh token
        return this.authService.refreshTokens(user.uid, refreshToken);
    }

    @Get("auth/session")
    async getSession(@Req() req) {
        if (req.user) {
            return { user: req.user }; 
        } else {
            throw new UnauthorizedException("Nenhuma sessão ativa");
        }
    }

    @Get("auth/providers")
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


