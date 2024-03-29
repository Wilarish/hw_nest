import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { CommentsService } from '../1-services/comments.service';
import { CommentsQueryRepository } from '../2-repositories/query/comments.query.repository';
import { CommentsViewType } from '../5-dtos/comments.types';
import { CustomObjectIdValidationPipe } from '../7-config/validation-pipes/custom-objectId-pipe';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentsService: CommentsService,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}
  @Get(':id')
  async getCommentById(
    @Param('id', CustomObjectIdValidationPipe) blogId: string,
  ) {
    const comment: CommentsViewType | null =
      await this.commentsQueryRepository.returnCommentById(blogId);
    if (!comment) throw new HttpException('error 404', HttpStatus.NOT_FOUND);
    return comment;
  }
}
