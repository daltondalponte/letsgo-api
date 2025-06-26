import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {

  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }); // <-- LINHA ALTERADA AQUI
  }

<<<<<<< HEAD
  async validate(email: string, password: string): Promise<any> {
    
    const user = await this.authService.validateUser(email, password);
=======
  async validate(username: string, password: string): Promise<any> {
>>>>>>> adc28d84afffc4eab260cd35bb11472ec8efc810

    const user = await this.authService.findByEmail(username);
    
    await this.authService.validateUserPassword(user, password);

    return user;
  }
}
