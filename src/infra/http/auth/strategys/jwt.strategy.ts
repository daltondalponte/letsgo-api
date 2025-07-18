import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // Importe ConfigService

@Injectable() 
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) { // Injete ConfigService
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'), // Use configService.get()
    });
  }

  async validate(payload: any) {
    return { 
      userId: payload.sub, 
      uid: payload.sub, // Adicionar uid para compatibilidade
      username: payload.username, 
      role: payload.role,
      type: payload.role // Garantir que o type está sendo passado
    };
  }
}
