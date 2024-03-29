import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BlogsService } from '../1-services/blogs.service';
import { BlogsViewType } from '../5-dtos/blog.types';
import { BlogsQueryRepository } from '../repositories/query/blogs.query.repository';
import {
  getBlogsPagination,
  getDefaultPagination,
} from '../6-helpers/pagination.helpers';
import { BlogsPaginationType, Paginated } from '../5-dtos/pagination.types';
import { PostsViewType } from '../5-dtos/posts.types';
import { PostsService } from '../1-services/posts.service';
import { PostsQueryRepository } from '../repositories/query/posts.query.repository';
import { ObjectId } from 'mongodb';
import { BlogsCreateUpdateValid } from '../7-config/validation-pipes/blogs.pipes';
import { PostsCreateInBlogsControllerValidate } from '../7-config/validation-pipes/posts.pipes';
import { CustomObjectIdValidationPipe } from '../7-config/validation-pipes/custom-objectId-pipe';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
  ) {}
  @Get()
  async getAllBlogs(@Query() params: any) {
    const pagination: BlogsPaginationType = getBlogsPagination(params);
    const blogs: Paginated<BlogsViewType> =
      await this.blogsQueryRepository.returnAllViewBlogs(pagination);

    return blogs;
  }

  @Get(':id')
  async getBlogById(@Param('id', CustomObjectIdValidationPipe) blogId: string) {
    const blog: BlogsViewType | null =
      await this.blogsQueryRepository.returnViewBlogById(blogId);

    if (!blog) throw new HttpException('not found ', HttpStatus.NOT_FOUND);

    return blog;
  }
  @Get(':id/posts')
  async getAllPostsForBlogs(
    @Param('id', CustomObjectIdValidationPipe) blogId: string,
    @Query() params: any,
  ) {
    const blog: BlogsViewType | null =
      await this.blogsQueryRepository.returnViewBlogById(blogId);
    if (!blog) throw new HttpException('404 not found', HttpStatus.NOT_FOUND);

    const pagination = getDefaultPagination(params);
    const posts: Paginated<PostsViewType> =
      await this.blogsQueryRepository.returnViewPostsForBlogsById(
        blogId,
        pagination,
      );
    return posts;
  }

  @Post()
  async createBlog(@Body() dto: BlogsCreateUpdateValid) {
    const idOfCreationBlog: string | null =
      await this.blogsService.createBlog(dto);

    if (!idOfCreationBlog)
      throw new HttpException('error', HttpStatus.BAD_GATEWAY);

    const blog: BlogsViewType | null =
      await this.blogsQueryRepository.returnViewBlogById(idOfCreationBlog);

    if (!blog)
      throw new HttpException(
        'error 500 (manually)',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    return blog;
  }

  @Post(':id/posts')
  async createPostForBlog(
    @Param('id', CustomObjectIdValidationPipe) blogId: string,
    @Body() dto: PostsCreateInBlogsControllerValidate,
  ) {
    const blog: BlogsViewType | null =
      await this.blogsQueryRepository.returnViewBlogById(blogId);

    if (!blog) throw new HttpException('not found ', HttpStatus.NOT_FOUND);

    const new_postId: string | null = await this.postsService.createPost({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: new ObjectId(blogId),
    });
    if (!new_postId)
      throw new HttpException('error', HttpStatus.INTERNAL_SERVER_ERROR);

    const newPost: PostsViewType | null =
      await this.postsQueryRepository.returnViewPostById(new_postId);

    return newPost;
  }

  @Put(':id')
  @HttpCode(204)
  async changeBlog(
    @Param('id', CustomObjectIdValidationPipe) blogId: string,
    @Body() dto: BlogsCreateUpdateValid,
  ) {
    const foundBlog: BlogsViewType | null =
      await this.blogsQueryRepository.returnViewBlogById(blogId);
    if (!foundBlog) throw new HttpException('not found', HttpStatus.NOT_FOUND);

    const result: boolean = await this.blogsService.updateBlog(blogId, dto);
    if (!result)
      throw new HttpException(
        'error 500 (manually)',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id', CustomObjectIdValidationPipe) blogId: string) {
    const deleteResult: boolean = await this.blogsService.deleteBlog(blogId);

    if (!deleteResult)
      throw new HttpException('not found', HttpStatus.NOT_FOUND);
  }
}
