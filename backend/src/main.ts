import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { bufferLogs: false });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  app.setGlobalPrefix('api/v1', {
    exclude: ['docs'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

app.enableCors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173'],
  credentials: true,
});


  const swaggerConfig = new DocumentBuilder()
    .setTitle('ResearchPilot API')
    .setDescription('AI Research Agent Backend — SerpApi India Hackathon 2026, Track 01: AI Agents')
    .setVersion('1.0.0')
    .addTag('research', 'Research session management')
    .addTag('reports', 'Research report retrieval')
    .addTag('events', 'SSE progress streaming')
    .addTag('health', 'Health checks')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  logger.log(`ResearchPilot API running on http://localhost:${port}`);
  logger.log(`Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
