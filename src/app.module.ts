import { Module } from '@nestjs/common';
import { AppController } from './0-controllers/app.controller';
import { AppService } from './1-services/app.service';
import { BlogsController } from './0-controllers/blogs.controller';
import { BlogsService } from './1-services/blogs.service';
import { CommentsService } from './1-services/comments.service';
import { PostsService } from './1-services/posts.service';
import { UsersService } from './1-services/users.service';
import { BlogsRepository } from './repositories/blogs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsMainClass, BlogsSchema } from './3-schemas/blogs.schema';
import { mongoURI } from './db.connectino.string';
import { BlogsQueryRepository } from './repositories/query/blogs.query.repository';
import { PostsController } from './0-controllers/posts.controller';
import { PostsQueryRepository } from './repositories/query/posts.query.repository';
import { PostsRepository } from './repositories/posts.repository';
import { PostsMainClass, PostsSchema } from './3-schemas/posts.schema';
import { UsersMainClass, UsersSchema } from './3-schemas/users.scema';
import { CommentsMainClass, CommentsSchema } from './3-schemas/comments.schema';
import { CommentsRepository } from './repositories/comments.repository';
import { CommentsQueryRepository } from './repositories/query/comments.query.repository';
import { CommentsController } from './0-controllers/comments.controller';
import { UsersRepository } from './repositories/users.repository';
import { UsersQueryRepository } from './repositories/query/users.query.repository';
import { BcryptAdapter } from './4-adapters/bcrypt.adapter';
import { UsersController } from './0-controllers/users.controller';
import { LoginOrEmailIsAlreadyExistValidator } from './7-config/validation-pipes/custom-decorators/login-or-email-is-exist.validator';
import { IsBlogExistValidator } from './7-config/validation-pipes/custom-decorators/is-blog-exist';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
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
    ]),
    JwtModule.register({
      global: true,
      secret: 'qwerty',
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [
    AppController,
    BlogsController,
    PostsController,
    CommentsController,
    UsersController,
  ],
  providers: [
    LoginOrEmailIsAlreadyExistValidator,
    IsBlogExistValidator,

    AppService,
    BlogsService,
    CommentsService,
    PostsService,
    UsersService,

    UsersQueryRepository,
    BlogsQueryRepository,
    PostsQueryRepository,
    CommentsQueryRepository,

    CommentsRepository,
    PostsRepository,
    BlogsRepository,
    UsersRepository,

    BcryptAdapter,
  ],
})
export class AppModule {}
