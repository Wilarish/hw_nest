import { Controller, Delete, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { BlogsRepository } from '../repositories/blogs.repository';
import { PostsRepository } from '../repositories/posts.repository';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
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
  }
}
