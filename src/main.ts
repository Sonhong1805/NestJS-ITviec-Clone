declare const module: any;

import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { TransformResponseInterceptor } from './commons/interceptors/transform.response.interceptor';
import { AllExceptionsFilter } from './commons/filters/all-exceptions.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { validateEnvironments } from './configs/configuration';

async function bootstrap() {
  validateEnvironments();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  const apiPrefix = 'api/v1';
  const apiVersion = '1.0';

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.use(helmet());
  app.enableCors({
    exposedHeaders: ['Content-Disposition'],
  });

  app.setGlobalPrefix(apiPrefix);
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );
  app.useGlobalInterceptors(new TransformResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  const config = new DocumentBuilder()
    .setTitle('IT VIEC API')
    .setDescription('API for IT viec')
    .setVersion(apiVersion)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(process.env.PORT);
  Logger.log(`Application started on port: ${port}`);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
