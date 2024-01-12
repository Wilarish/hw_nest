import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { BlogsController } from './controllers/blogs.controller';
import { BlogsService } from './services/blogs.service';
import { CommentsService } from './services/comments.service';
import { PostsService } from './services/posts.service';
import { UsersService } from './services/users.service';
import { BlogsRepository } from './repositories/blogs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsMainClass, BlogsSchema } from './schemas/blogs.schema';
import { mongoURI } from './db.connectino.string';
import { BlogsQueryRepository } from './repositories/query/blogs.query.repository';
import { PostsController } from './controllers/posts.controller';
import { PostsQueryRepository } from './repositories/query/posts.query.repository';
import { PostsRepository } from './repositories/posts.repository';
import { PostsMainClass, PostsSchema } from './schemas/posts.schema';
import { UsersMainClass, UsersSchema } from './schemas/users.scema';
import { CommentsMainClass, CommentsSchema } from './schemas/comments.schema';
import { CommentsRepository } from './repositories/comments.repository';
import { CommentsQueryRepository } from './repositories/query/comments.query.repository';
import { CommentsController } from './controllers/comments.controller';
import { UsersRepository } from './repositories/users.repository';
import { UsersQueryRepository } from './repositories/query/users.query.repository';
import { BcryptAdapter } from './adapters/bcrypt.adapter';
import { UsersController } from './controllers/users.controller';

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
  ],
  controllers: [
    AppController,
    BlogsController,
    PostsController,
    CommentsController,
    UsersController,
  ],
  providers: [
    AppService,
    BlogsService,
    CommentsService,
    PostsService,
    UsersService,

    UsersQueryRepository,
    BlogsQueryRepository,
    PostsQueryRepository,
    CommentsRepository,
    CommentsQueryRepository,
    PostsRepository,
    BlogsRepository,
    UsersRepository,

    BcryptAdapter,
  ],
})
export class AppModule {}
