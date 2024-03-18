import { Controller, Delete, Get, HttpCode } from '@nestjs/common';
import { AppService } from '../1-services/app.service';
import { BlogsRepository } from '../repositories/blogs.repository';
import { PostsRepository } from '../repositories/posts.repository';
import { UsersRepository } from '../repositories/users.repository';
import { CommentsRepository } from '../repositories/comments.repository';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
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
