import './services/sentry';

import * as Sentry from '@sentry/nestjs';
import { Logger } from '@nestjs/common';
import {
  NestFactory,
  BaseExceptionFilter,
  HttpAdapterHost,
} from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);
  const port = 4000;

  app.enableCors({
    origin: '*',
  });

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const { httpAdapter } = app.get(HttpAdapterHost);
  Sentry.setupNestErrorHandler(app, new BaseExceptionFilter(httpAdapter));

  await app.listen(port);

  logger.log(`Application listening on port ${port}`);
}
bootstrap();
