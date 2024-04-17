import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostsViewType } from '../5-dtos/posts.types';
import { PostsService } from '../1-services/posts.service';
import { PostsQueryRepository } from '../2-repositories/query/posts.query.repository';
import { getDefaultPagination } from '../6-helpers/pagination.helpers';
import { DefaultPaginationType, Paginated } from '../5-dtos/pagination.types';
import { CommentsViewType } from '../5-dtos/comments.types';
import { CommentsQueryRepository } from '../2-repositories/query/comments.query.repository';
import { PostsCreateUpdateValidate } from '../7-config/validation-pipes/posts.pipes';
import { CustomObjectIdValidationPipe } from '../7-config/validation-pipes/custom-objectId-pipe';
import { CommentsCreateUpdateValidate } from '../7-config/validation-pipes/comments.pipes';
import { CommentsService } from '../1-services/comments.service';
import { Request } from 'express';
import { BearerAuthGuard } from '../7-config/guards/bearer.auth.guard';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    private readonly commentsService: CommentsService,
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
  async getPostById(@Param('id', CustomObjectIdValidationPipe) postId: string) {
    const foundPost: PostsViewType | null =
      await this.postsQueryRepository.returnViewPostById(postId);
    if (!foundPost) {
      throw new NotFoundException();
    }
    return foundPost;
  }
  @Get(':id/comments')
  async getAllCommentsForPost(
    @Param('id', CustomObjectIdValidationPipe) postId: string,
    @Query() params: any,
  ) {
    const pagination: DefaultPaginationType = getDefaultPagination(params);
    const comments: Paginated<CommentsViewType> | null =
      await this.commentsQueryRepository.returnQueryComments(
        pagination,
        postId,
        undefined,
      );

    if (!comments) {
      throw new NotFoundException();
    }

    return comments;
  }

  @Post()
  async createPost(@Body() dto: PostsCreateUpdateValidate) {
    const new_postId: string | null = await this.postsService.createPost(dto);
    if (!new_postId)
      throw new HttpException('500 error', HttpStatus.INTERNAL_SERVER_ERROR);

    const newPost: PostsViewType | null =
      await this.postsQueryRepository.returnViewPostById(new_postId);

    return newPost;
  }
  @Post(':id/comments')
  @UseGuards(BearerAuthGuard)
  async createCommentForPost(
    @Body() dto: CommentsCreateUpdateValidate,
    @Param('id') postId: string,
    @Req() req: Request,
  ) {
    const comment = await this.commentsService.createCommentForPost(
      postId,
      dto,
      req.userId,
    ); //Object result
    if (!comment) {
      throw new NotFoundException();
    }
  }
  @Put(':id')
  @HttpCode(204)
  async updatePost(
    @Body() dto: PostsCreateUpdateValidate,
    @Param('id', CustomObjectIdValidationPipe) postId: string,
  ) {
    const new_post: PostsViewType | null =
      await this.postsQueryRepository.returnViewPostById(postId.toString());

    if (!new_post) throw new NotFoundException();

    const resultId: boolean = await this.postsService.updatePost(postId, dto);
    if (!resultId) throw new BadRequestException();

    return;
  }

  @Delete(':id')
  @HttpCode(204)
  async deletePost(@Param('id', CustomObjectIdValidationPipe) postId: string) {
    const deleteResult: boolean = await this.postsService.deletePost(postId);

    if (!deleteResult) {
      throw new NotFoundException();
    }
    return;
  }
}
