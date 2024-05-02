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
import {
  BearerAuthGuard,
  BearerAuthGuardWithout401Exception,
} from '../7-config/guards/bearer.auth.guard';
import { Request } from 'express';
import request from 'supertest';
import * as stream from 'stream';
import * as string_decoder from 'string_decoder';
import { parseAnyDigitsSigned } from 'date-fns/parse/_lib/utils';
import { LikeStatusValid } from '../7-config/validation-pipes/likes.pipes';
import { LikesServices } from '../1-services/likes.services';
import { likeTypes } from '../5-dtos/likes.types';
import { ResponseToControllersHelper } from '../6-helpers/response.to.controllers.helper';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly likesServices: LikesServices,
  ) {}
  @Get(':id')
  @UseGuards(BearerAuthGuardWithout401Exception)
  async getCommentById(
    @Param('id', CustomObjectIdValidationPipe) commentId: string,
    @Req() req: Request,
  ) {
    const result: ResponseToControllersHelper =
      await this.commentsQueryRepository.returnCommentById(
        commentId,
        req.userId,
      );
    return ResponseToControllersHelper.checkReturnException(result);
  }
  @Put(':id')
  @UseGuards(BearerAuthGuard)
  @HttpCode(204)
  async updateComment(
    @Param('id', CustomObjectIdValidationPipe) commentId: string,
    @Req() req: Request,
    @Body() dto: CommentsCreateUpdateValidate,
  ) {
    const result: ResponseToControllersHelper =
      await this.commentsService.updateComment(commentId, dto, req.userId);
    return ResponseToControllersHelper.checkReturnException(result);
  }
  @Put(':id/like-status')
  @UseGuards(BearerAuthGuard)
  @HttpCode(204)
  async rateComment(
    @Param('id', CustomObjectIdValidationPipe) commentId: string,
    @Body() dto: LikeStatusValid,
    @Req() req: Request,
  ) {
    const result: ResponseToControllersHelper =
      await this.likesServices.rateCommentOrPost(
        commentId,
        dto.likeStatus,
        req.userId.toString(),
        likeTypes.Comment,
      );

    return ResponseToControllersHelper.checkReturnException(result);
  }
  @Delete(':id')
  @UseGuards(BearerAuthGuard)
  @HttpCode(204)
  async deleteComment(
    @Param('id', CustomObjectIdValidationPipe) commentId: string,
    @Req() req: Request,
  ) {
    const result: ResponseToControllersHelper =
      await this.commentsService.deleteComment(commentId, req.userId);

    return ResponseToControllersHelper.checkReturnException(result);
  }
}
