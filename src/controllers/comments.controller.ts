import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { CommentsService } from '../services/comments.service';
import { CommentsQueryRepository } from '../repositories/query/comments.query.repository';
import { CommentsViewType } from '../types/comments.types';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentsService: CommentsService,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}
  @Get(':id')
  async getCommentById(@Param('id') blogId: string) {
    const comment: CommentsViewType | null =
      await this.commentsQueryRepository.returnCommentById(blogId);
    if (!comment) throw new HttpException('error 404', HttpStatus.NOT_FOUND);
    return comment;
  }
}
