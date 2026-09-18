"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: false });
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT', 3000);
    app.setGlobalPrefix('api/v1', {
        exclude: ['docs'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.enableCors({
        origin: [process.env.FRONTEND_URL || 'http://localhost:5173'],
        credentials: true,
    });
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('ResearchPilot API')
        .setDescription('AI Research Agent Backend — SerpApi India Hackathon 2026, Track 01: AI Agents')
        .setVersion('1.0.0')
        .addTag('research', 'Research session management')
        .addTag('reports', 'Research report retrieval')
        .addTag('events', 'SSE progress streaming')
        .addTag('health', 'Health checks')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    await app.listen(port);
    logger.log(`ResearchPilot API running on http://localhost:${port}`);
    logger.log(`Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map