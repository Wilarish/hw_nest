import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../repositories/comments.repository';

@Injectable()
export class CommentsService {
  constructor(private commentsRepository: CommentsRepository) {}
  returnCommentById(id: string): string {
    return 'comment with id : ' + id;
  }

  async returnAllComments() {
    return;
  }
}
