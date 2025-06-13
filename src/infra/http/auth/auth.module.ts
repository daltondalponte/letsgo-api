import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategys/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { DataBaseModule } from '@infra/database/database.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategys/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RefreshTokenStrategy } from './strategys/refresh-token.strategy';
import { PasswordResetService } from './reset-password.service';
import { MailModule } from '@infra/email/nodemailer/mail.module';
import { PaymentModule } from '@infra/payment/payment.module';
import { PermissionsService } from './permissions.service';
import { CanInsertCuponsGuard } from './guards/cupom/can-insert-cupons.guard';
import { CanUpdateCuponsGuard } from './guards/cupom/can-update-cupons.guard';
import { EnsureManagerEvent } from './guards/ensure-manage-event.guard';
import { EnsureOwnerEvent } from './guards/ensure-owner-event.guard';
import { EnsureProfessionalUser } from './guards/ensure-professional-user.guard';
import { CanInsertTicketsGuard } from './guards/ticket/can-insert-tickets.guard';
import { CanUpdateticketsGuard } from './guards/ticket/can-update-tickets.guard';
import { FacebookStrategy } from './strategys/facebook.strategy';
// import { GoogleStrategy } from './strategys/google.strategy';
import { UserApplicationModule } from '@application/user/user.application.module';
import { HttpModule } from '@nestjs/axios'; // <-- ADICIONADO IMPORT

@Module({
  imports: [
    DataBaseModule,
    MailModule,
    PaymentModule,
    ConfigModule.forRoot() ,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    UserApplicationModule,
    HttpModule, // <-- ADICIONADO HttpModule AOS IMPORTS
  ],
  providers: [
    AuthService,
    PasswordResetService,
    PermissionsService,
    // Strategies
    LocalStrategy,
    JwtStrategy,
    RefreshTokenStrategy,
    FacebookStrategy,
    // GoogleStrategy,
    // Guards
    CanInsertCuponsGuard,
    CanUpdateCuponsGuard,
    CanInsertTicketsGuard,
    CanUpdateticketsGuard,
    EnsureManagerEvent,
    EnsureOwnerEvent,
    EnsureProfessionalUser,
    // Services
    ConfigService,
  ],
  exports: [AuthService, PasswordResetService, PermissionsService, JwtModule]
})
export class AuthModule { }
