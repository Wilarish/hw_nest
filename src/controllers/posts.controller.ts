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
import { PostsCreateUpdate, PostsViewType } from '../types/posts.types';
import { PostsService } from '../services/posts.service';
import { PostsQueryRepository } from '../repositories/query/posts.query.repository';
import { getDefaultPagination } from '../helpers/pagination.helpers';
import { DefaultPaginationType, Paginated } from '../types/pagination.types';
import { CommentsViewType } from '../types/comments.types';
import { CommentsQueryRepository } from '../repositories/query/comments.query.repository';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}
  @Get()
  async getAllPosts(@Query() params: any) {
    const pagination: DefaultPaginationType = getDefaultPagination(params);
    const posts: Paginated<PostsViewType> =
      await this.postsQueryRepository.queryFindPaginatedPosts(
        pagination,
        undefined,
      );

    return posts;
  }

  @Get(':id')
  async getPostById(@Param('id') postId: string) {
    const foundPost: PostsViewType | null =
      await this.postsQueryRepository.returnViewPostById(postId);
    if (!foundPost)
      throw new HttpException('not found 404', HttpStatus.NOT_FOUND);
    return foundPost;
  }
  @Get(':id/comments')
  async getAllCommentsForPost(
    @Param('id') postId: string,
    @Query() params: any,
  ) {
    const pagination: DefaultPaginationType = getDefaultPagination(params);
    const comments: Paginated<CommentsViewType> | null =
      await this.commentsQueryRepository.returnQueryComments(
        pagination,
        postId,
        undefined,
      );

    if (!comments)
      throw new HttpException('404 not found', HttpStatus.NOT_FOUND);

    return comments;
  }

  @Post()
  async createPost(@Body() dto: PostsCreateUpdate) {
    const new_postId: string | null = await this.postsService.createPost(dto);
    if (!new_postId)
      throw new HttpException('500 error', HttpStatus.INTERNAL_SERVER_ERROR);

    const newPost: PostsViewType | null =
      await this.postsQueryRepository.returnViewPostById(new_postId);

    return newPost;
  }

  @Put(':id')
  @HttpCode(204)
  async updatePost(
    @Body() dto: PostsCreateUpdate,
    @Param('id') postId: string,
  ) {
    const new_post: PostsViewType | null =
      await this.postsQueryRepository.returnViewPostById(postId.toString());

    if (!new_post)
      throw new HttpException('not found 404', HttpStatus.NOT_FOUND);

    const resultId: boolean = await this.postsService.updatePost(postId, dto);
    if (!resultId)
      throw new HttpException('500 error', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @Delete(':id')
  @HttpCode(204)
  async deletePost(@Param('id') postId: string) {
    const deleteResult: boolean = await this.postsService.deletePost(postId);

    if (!deleteResult)
      throw new HttpException('not found', HttpStatus.NOT_FOUND);
  }
}
