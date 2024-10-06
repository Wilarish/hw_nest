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
import { PostsService } from '../1-services/posts.service';
import { PostsQueryRepository } from '../2-repositories/query/posts.query.repository';
import { CommentsQueryRepository } from '../2-repositories/query/comments.query.repository';
import { CommentsService } from '../1-services/comments.service';
import { Request } from 'express';
import { LikesServices } from '../1-services/likes.services';
import { likeTypes } from '../5-dtos/likes.types';
import { ResponseToControllersHelper } from '../6-helpers/response.to.controllers.helper';
import {
  BearerAuthGuard,
  BearerAuthGuardWithout401Exception,
} from '../7-common/guards/bearer.auth.guard';
import { CustomObjectIdValidationPipe } from '../7-common/validation-pipes/custom-objectId-pipe';
import { PostsCreateUpdateValidate } from '../7-common/validation-pipes/posts.pipes';
import { CommentsCreateUpdateValidate } from '../7-common/validation-pipes/comments.pipes';
import { LikeStatusValid } from '../7-common/validation-pipes/likes.pipes';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commentsService: CommentsService,
    private readonly likesService: LikesServices,
  ) {}
  @Get()
  @UseGuards(BearerAuthGuardWithout401Exception)
  async getAllPosts(@Query() params: any, @Req() req: Request) {
    const result: ResponseToControllersHelper =
      await this.postsQueryRepository.queryFindPaginatedPosts(
        params,
        req.userId,
      );

    return ResponseToControllersHelper.checkReturnException(result);
  }

  @Get(':id')
  @UseGuards(BearerAuthGuardWithout401Exception)
  async getPostById(
    @Param('id', CustomObjectIdValidationPipe) postId: string,
    @Req() req: Request,
  ) {
    const result: ResponseToControllersHelper =
      await this.postsQueryRepository.returnViewPostById(postId, req.userId);

    return ResponseToControllersHelper.checkReturnException(result);
  }
  @Get(':id/comments')
  @UseGuards(BearerAuthGuardWithout401Exception)
  async getAllCommentsForPost(
    @Param('id', CustomObjectIdValidationPipe) postId: string,
    @Query() params: any,
    @Req() req: Request,
  ) {
    const result: ResponseToControllersHelper =
      await this.commentsQueryRepository.returnQueryComments(
        params,
        postId,
        req.userId,
      );

    return ResponseToControllersHelper.checkReturnException(result);
  }

  @Post()
  async createPost(@Body() dto: PostsCreateUpdateValidate) {
    const result = await this.postsService.createPost(dto);
    const resultView: ResponseToControllersHelper =
      await this.postsQueryRepository.returnViewPostById(
        result.responseData as string,
      );

    return ResponseToControllersHelper.checkReturnException(resultView);
  }
  @Post(':id/comments')
  @UseGuards(BearerAuthGuard)
  async createCommentForPost(
    @Body() dto: CommentsCreateUpdateValidate,
    @Param('id', CustomObjectIdValidationPipe) postId: string,
    @Req() req: Request,
  ) {
    const result: ResponseToControllersHelper =
      await this.commentsService.createCommentForPost(postId, dto, req.userId);

    const resultView = await this.commentsQueryRepository.returnCommentById(
      result.responseData as string,
    );

    return ResponseToControllersHelper.checkReturnException(resultView);
  }
  @Put(':id')
  @HttpCode(204)
  async updatePost(
    @Body() dto: PostsCreateUpdateValidate,
    @Param('id', CustomObjectIdValidationPipe) postId: string,
  ) {
    const result = await this.postsService.updatePost(postId, dto);

    return ResponseToControllersHelper.checkReturnException(result);
  }

  @Put(':id/like-status')
  @UseGuards(BearerAuthGuard)
  @HttpCode(204)
  async ratePost(
    @Body() dto: LikeStatusValid,
    @Param('id', CustomObjectIdValidationPipe) postId: string,
    @Req() req: Request,
  ) {
    const result = await this.likesService.rateCommentOrPost(
      postId,
      dto.likeStatus,
      req.userId,
      likeTypes.Post,
    );

    return ResponseToControllersHelper.checkReturnException(result);
  }
  @Delete(':id')
  @HttpCode(204)
  async deletePost(@Param('id', CustomObjectIdValidationPipe) postId: string) {
    const result = await this.postsService.deletePost(postId);

    return ResponseToControllersHelper.checkReturnException(result);
  }
}
