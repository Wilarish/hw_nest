import { ConfigModule } from '@nestjs/config';
import { getConfiguration } from './8-config/get.configuration';
const configModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [getConfiguration],
});

import { Module } from '@nestjs/common';
import { AppController } from './0-controllers/app.controller';
import { AppService } from './1-services/app.service';
import { BlogsController } from './0-controllers/blogs.controller';
import { BlogsService } from './1-services/blogs.service';
import { CommentsService } from './1-services/comments.service';
import { PostsService } from './1-services/posts.service';
import { BlogsRepository } from './2-repositories/blogs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsMainClass, BlogsSchema } from './3-schemas/blogs.schema';
import { BlogsQueryRepository } from './2-repositories/query/blogs.query.repository';
import { PostsController } from './0-controllers/posts.controller';
import { PostsQueryRepository } from './2-repositories/query/posts.query.repository';
import { PostsRepository } from './2-repositories/posts.repository';
import { PostsMainClass, PostsSchema } from './3-schemas/posts.schema';
import { UsersMainClass, UsersSchema } from './3-schemas/users.scema';
import { CommentsMainClass, CommentsSchema } from './3-schemas/comments.schema';
import { CommentsRepository } from './2-repositories/comments.repository';
import { CommentsQueryRepository } from './2-repositories/query/comments.query.repository';
import { CommentsController } from './0-controllers/comments.controller';
import { BcryptAdapter } from './4-adapters/bcrypt.adapter';
import { JwtModule } from '@nestjs/jwt';
import { UsersController } from './0-controllers/users.controller';
import { UsersService } from './1-services/users.service';
import { UsersQueryRepository } from './2-repositories/query/users.query.repository';
import { UsersRepository } from './2-repositories/users.repository';
import { AuthController } from './0-controllers/auth.controller';
import { EmailServices } from './1-services/email-service';
import { emailAdapter } from './4-adapters/email.adapter';
import { AuthServices } from './1-services/auth.services';
import { JwtAdapter } from './4-adapters/jwt.adapter';
import { DevicesServices } from './1-services/devices.services';
import { DevicesRepository } from './2-repositories/devices.repository';
import { DeviceSchema, DevicesMainClass } from './3-schemas/devices.schema';
import { SecurityDevicesController } from './0-controllers/security.devices.controller';
import { DevicesQueryRepository } from './2-repositories/query/devices.query.repository';
import {
  RateLimitMainClass,
  RateLimitSchema,
} from './3-schemas/rate.limit.schema';
import { LikesMainClass, LikesSchema } from './3-schemas/likes.schema';
import { LikesServices } from './1-services/likes.services';
import { LikesRepository } from './2-repositories/likes.repository';
import { RatesHelper } from './6-helpers/rates.helper';
import { mongoURI } from './test';
import * as Joi from 'joi';
import { IsThisEmailConfirmedValidator } from './7-common/validation-pipes/custom-decorators/is-email-already-confirmed';
import { LoginOrEmailIsAlreadyExistValidator } from './7-common/validation-pipes/custom-decorators/login-or-email-is-exist.validator';
import { IsBlogExistValidator } from './7-common/validation-pipes/custom-decorators/is-blog-exist';
import { IsCodeIsAlreadyConfirmedValidator } from './7-common/validation-pipes/custom-decorators/is-email-code-is-already-confirmed';
import { IsThisEmailExistsValidator } from './7-common/validation-pipes/custom-decorators/is-email-exists';
import { IsConfirmationCodeExpiredValidator } from './7-common/validation-pipes/custom-decorators/is-confirmation-code-expired';
import { BasicAuthGuard } from './7-common/guards/basic.auth.guard';

@Module({
  imports: [
    configModule,
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().port().default(10000),
        MONGO_URL: Joi.string().required(),
        SECRET_JWT: Joi.string().required(),
        ADMIN_LOGIN_PASSWORD: Joi.string().required(),
      }),
    }),
    MongooseModule.forRoot(mongoURI),
    MongooseModule.forFeature([
      {
        name: BlogsMainClass.name,
        schema: BlogsSchema,
      },
      {
        name: PostsMainClass.name,
        schema: PostsSchema,
      },
      {
        name: UsersMainClass.name,
        schema: UsersSchema,
      },
      {
        name: CommentsMainClass.name,
        schema: CommentsSchema,
      },
      {
        name: DevicesMainClass.name,
        schema: DeviceSchema,
      },
      {
        name: RateLimitMainClass.name,
        schema: RateLimitSchema,
      },
      {
        name: LikesMainClass.name,
        schema: LikesSchema,
      },
    ]),
    JwtModule.register({
      global: true,
      signOptions: { expiresIn: '50s' },
    }),
  ],
  controllers: [
    AppController,
    BlogsController,
    PostsController,
    CommentsController,
    UsersController,
    AuthController,
    SecurityDevicesController,
  ],
  providers: [
    LoginOrEmailIsAlreadyExistValidator,
    IsBlogExistValidator,
    IsCodeIsAlreadyConfirmedValidator,
    IsThisEmailExistsValidator,
    IsThisEmailConfirmedValidator,
    IsConfirmationCodeExpiredValidator,

    BasicAuthGuard,

    AppService,
    BlogsService,
    CommentsService,
    PostsService,
    UsersService,
    EmailServices,
    AuthServices,
    DevicesServices,
    LikesServices,

    UsersQueryRepository,
    BlogsQueryRepository,
    PostsQueryRepository,
    CommentsQueryRepository,
    DevicesQueryRepository,

    DevicesRepository,
    CommentsRepository,
    PostsRepository,
    BlogsRepository,
    UsersRepository,
    LikesRepository,

    BcryptAdapter,
    emailAdapter,
    JwtAdapter,

    RatesHelper,
  ],
})
export class AppModule {}
