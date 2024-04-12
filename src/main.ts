import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as hbs from 'express-handlebars';
import * as cookieParser from 'cookie-parser';
import { UnauthorizedExceptionFilter } from './shared/exceptions/unauthorized.filter';
import * as dotenv from 'dotenv';
import { ForbiddenExceptionFilter } from './shared/exceptions/forbidden.filter';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.useGlobalFilters(new UnauthorizedExceptionFilter(), new ForbiddenExceptionFilter());
  app.useStaticAssets(join(__dirname, '..', 'uploads'));
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.engine('hbs', hbs.engine({ extname: 'hbs' }));
  app.setViewEngine('hbs');
  app.use(cookieParser());

  await app.listen(3000);
}
bootstrap();