import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from '../1-services/comments.service';
import { CommentsQueryRepository } from '../2-repositories/query/comments.query.repository';
import { CommentsViewType } from '../5-dtos/comments.types';
import { CustomObjectIdValidationPipe } from '../7-config/validation-pipes/custom-objectId-pipe';
import { CommentsCreateUpdateValidate } from '../7-config/validation-pipes/comments.pipes';
import { BearerAuthGuard } from '../7-config/guards/bearer.auth.guard';
import { Request } from 'express';
import request from 'supertest';
import * as stream from 'stream';
import * as string_decoder from 'string_decoder';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentsService: CommentsService,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}
  @Get(':id')
  async getCommentById(
    @Param('id', CustomObjectIdValidationPipe) commentId: string,
  ) {
    const comment: CommentsViewType | null =
      await this.commentsQueryRepository.returnCommentById(commentId);
    if (!comment) {
      throw new NotFoundException();
    }
    return comment;
  }
  @Put('id')
  @UseGuards(BearerAuthGuard)
  @HttpCode(204)
  async updateComment(
    @Param('id', CustomObjectIdValidationPipe) commentId: string,
    @Req() req: Request,
    @Body() dto: CommentsCreateUpdateValidate,
  ) {
    const comment: CommentsViewType | null =
      await this.commentsQueryRepository.returnCommentById(commentId);

    if (!comment) {
      throw new NotFoundException();
    }
    if (req.userId !== comment.commentatorInfo.userId.toString()) {
      throw new ForbiddenException();
    }
    const updateResult: boolean = await this.commentsService.updateComment(
      commentId,
      dto,
    );
    if (!updateResult) {
      throw new BadRequestException();
    }
    return;
  }

  @Delete('id')
  @UseGuards(BearerAuthGuard)
  @HttpCode(204)
  async deleteComment(
    @Param('id', CustomObjectIdValidationPipe) commentId: string,
    @Req() req: Request,
  ) {
    const comment: CommentsViewType | null =
      await this.commentsQueryRepository.returnCommentById(commentId);

    if (!comment) {
      throw new NotFoundException();
    }
    if (req.userId !== comment.commentatorInfo.userId.toString()) {
      throw new ForbiddenException();
    }
    const updateResult: boolean =
      await this.commentsService.deleteComment(commentId);
    if (!updateResult) {
      throw new BadRequestException();
    }
    return;
  }
}
