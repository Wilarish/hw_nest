import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { HttpExceptionFilter } from './7-config/exeption-filters/exeption.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({});
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const errorsForResponse: { message: string; field: string }[] = [];

        errors.forEach((e) => {
          if (!e.constraints)
            throw new HttpException([], HttpStatus.INTERNAL_SERVER_ERROR);

          const keys: string[] = Object.keys(e.constraints);

          errorsForResponse.push({
            field: e.property,
            message: e.constraints[keys[0]],
          });
        });

        throw new HttpException(errorsForResponse, HttpStatus.BAD_REQUEST);
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(3000);
}
bootstrap();
