//@ts-ignore
// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import basicAuth from 'express-basic-auth'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true
  });

  app.use(['/docs', '/docs-json'], basicAuth({
    challenge: true,
    users: {
      [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD,
    },
  }));

  const config = new DocumentBuilder()
    .setTitle('Lets Go API')
    .setDescription('Documentação da API do APP LetsGo')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document);
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors();
  await app.listen(process.env.PORT || 3008);
}
bootstrap();
