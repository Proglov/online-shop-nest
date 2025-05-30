import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as colors from 'colors';
import * as cookieParser from 'cookie-parser';
import { JWT_Cookie_Name } from './common/constants';
import { corsOptions } from './configs/cors.config';



async function bootstrap() {
  const PORT = process.env.PORT ?? 4500
  const ENV = process.env.NODE_ENV || 'unset'
  const allowedOrigins = process.env?.ALLOWED_ORIGINS.split(',') || []

  const app = await NestFactory.create(AppModule);

  //global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }))

  //cookie parser
  app.use(cookieParser());

  //cors
  app.enableCors(corsOptions(allowedOrigins))

  //swagger configuration
  if (ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Moolian')
      .setLicense('MIT', 'https://github.com/git/git-scm.com/blob/main/MIT-LICENCE.txt')
      .addServer('http://localhost:' + PORT)
      .addCookieAuth(JWT_Cookie_Name)
      .setVersion('1.0')
      .setExternalDoc('Postman Collection', '/api-json')
      .build();
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api', app, document)
  }

  //app listen
  if (ENV === 'development') {
    await app.listen(PORT);
  } else {
    await app.listen(PORT, '0.0.0.0');
  }


  const messages = [
    colors.black.bgWhite.bold('App Running in '.toUpperCase()),
    colors.green.bgWhite.bold(ENV.toUpperCase()),
    colors.black.bgWhite.bold(' environment on port '.toUpperCase()),
    colors.green.bgWhite.bold(PORT.toString().toUpperCase()),
    ''
  ]

  console.log(...messages);
  ENV === 'development' && console.log(colors.magenta.bold('http://localhost:' + PORT + '/api/'));
}

bootstrap();