import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook-token';
import { AuthService } from '../auth.service'; // Adjust path as needed
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook-token') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID'), // Use environment variable
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET'), // Use environment variable
      fbGraphVersion: 'v18.0',
      profileFields: ['id', 'name', 'displayName', 'emails', 'photos'], // Fields to request from Facebook
      // Add dummy URLs required by underlying OAuth2Strategy, even if not used by passport-facebook-token
      authorizationURL: 'https://www.facebook.com/v18.0/dialog/oauth', 
      tokenURL: 'https://graph.facebook.com/v18.0/oauth/access_token',
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    try {
      // console.log('Facebook Profile:', profile);
      const { name, emails, photos, id } = profile;
      const email = emails && emails.length > 0 ? emails[0].value : null;
      const photo = photos && photos.length > 0 ? photos[0].value : null;
      // Ensure displayName is correctly assembled
      const displayName = name && name.givenName && name.familyName ? `${name.givenName} ${name.familyName}` : profile.displayName;

      if (!email) {
        // Handle case where email is not provided by Facebook
        // You might want to prompt the user for an email or deny login
        return done(new UnauthorizedException('Email não fornecido pelo Facebook.'), null);
      }

      // Find or create user in your database using the AuthService method
      const user = await this.authService.validateOAuthLogin(id, 'facebook', email, displayName, photo);
      
      // The user object returned here will be attached to req.user
      done(null, user);
    } catch (err) {
      console.error("Error in FacebookStrategy validate:", err);
      done(err, false);
    }
  }
}

