import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppSettings } from './app.settings';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  AppSettings(app);
  await app.listen(10000);
}
bootstrap();
