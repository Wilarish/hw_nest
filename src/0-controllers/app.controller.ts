import { Controller, Delete, Get, HttpCode } from '@nestjs/common';
import { AppService } from '../1-services/app.service';
import { BlogsRepository } from '../2-repositories/blogs.repository';
import { PostsRepository } from '../2-repositories/posts.repository';
import { UsersRepository } from '../2-repositories/users.repository';
import { CommentsRepository } from '../2-repositories/comments.repository';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../8-config/get.configuration';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly configService: ConfigService<ConfigType>,
  ) {}

  @Get()
  getHello() {
    return {
      MONGO_URL: this.configService.get('MONGO_URL', { infer: true }),
      SECRET_JWT: this.configService.get('SECRET_JWT', { infer: true }),
      ADMIN_LOGIN_PASSWORD: this.configService.get('ADMIN_LOGIN_PASSWORD', {
        infer: true,
      }),
    };
  }
  @Delete('testing/all-data')
  @HttpCode(204)
  async deleteAll() {
    await this.blogsRepository.deleteAllBlogs();
    await this.postsRepository.deleteAllPosts();
    await this.usersRepository.deleteAllUsers();
    await this.commentsRepository.deleteAllComments();
  }
}
