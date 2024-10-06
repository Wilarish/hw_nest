import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from '../1-services/blogs.service';
import { BlogsQueryRepository } from '../2-repositories/query/blogs.query.repository';
import { PostsQueryRepository } from '../2-repositories/query/posts.query.repository';
import { Request } from 'express';
import { ResponseToControllersHelper } from '../6-helpers/response.to.controllers.helper';
import { CustomObjectIdValidationPipe } from '../7-common/validation-pipes/custom-objectId-pipe';
import { BearerAuthGuardWithout401Exception } from '../7-common/guards/bearer.auth.guard';
import { BlogsCreateUpdateValid } from '../7-common/validation-pipes/blogs.pipes';
import { PostsCreateInBlogsControllerValidate } from '../7-common/validation-pipes/posts.pipes';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}
  @Get()
  async getAllBlogs(@Query() params: any) {
    const result: ResponseToControllersHelper =
      await this.blogsQueryRepository.returnAllViewBlogs(params);

    return ResponseToControllersHelper.checkReturnException(result);
  }

  @Get(':id')
  async getBlogById(@Param('id', CustomObjectIdValidationPipe) blogId: string) {
    const result: ResponseToControllersHelper =
      await this.blogsQueryRepository.returnViewBlogById(blogId);

    return ResponseToControllersHelper.checkReturnException(result);
  }
  @Get(':id/posts')
  @UseGuards(BearerAuthGuardWithout401Exception)
  async getAllPostsForBlog(
    @Param('id', CustomObjectIdValidationPipe) blogId: string,
    @Query() params: any,
    @Req() req: Request,
  ) {
    const result: ResponseToControllersHelper =
      await this.blogsQueryRepository.returnViewPostsForBlogById(
        blogId,
        params,
        req.userId,
      );
    return ResponseToControllersHelper.checkReturnException(result);
  }

  @Post()
  async createBlog(@Body() dto: BlogsCreateUpdateValid) {
    const resultCreateBlog: ResponseToControllersHelper =
      await this.blogsService.createBlog(dto);

    const result: ResponseToControllersHelper =
      await this.blogsQueryRepository.returnViewBlogById(
        resultCreateBlog.responseData as string,
      );

    return ResponseToControllersHelper.checkReturnException(result);
  }

  @Post(':id/posts')
  @UseGuards(BearerAuthGuardWithout401Exception)
  async createPostForBlog(
    @Param('id', CustomObjectIdValidationPipe) blogId: string,
    @Body() dto: PostsCreateInBlogsControllerValidate,
    @Req() req: Request,
  ) {
    const resultCreatePost: ResponseToControllersHelper =
      await this.blogsService.createPostForBlog(dto, blogId);

    const result: ResponseToControllersHelper =
      await this.postsQueryRepository.returnViewPostById(
        resultCreatePost.responseData as string,
        req.userId,
      );

    return ResponseToControllersHelper.checkReturnException(result);
  }

  @Put(':id')
  @HttpCode(204)
  async changeBlog(
    @Param('id', CustomObjectIdValidationPipe) blogId: string,
    @Body() dto: BlogsCreateUpdateValid,
  ) {
    const result: ResponseToControllersHelper =
      await this.blogsService.updateBlog(blogId, dto);
    return ResponseToControllersHelper.checkReturnException(result);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id', CustomObjectIdValidationPipe) blogId: string) {
    const result: ResponseToControllersHelper =
      await this.blogsService.deleteBlog(blogId);

    return ResponseToControllersHelper.checkReturnException(result);
  }
}
