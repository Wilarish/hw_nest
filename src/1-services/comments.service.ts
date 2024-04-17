import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../2-repositories/comments.repository';
import { CommentsCreateUpdateValidate } from '../7-config/validation-pipes/comments.pipes';
import {
  CommentsMainType,
  CommentsUpdateWith_id,
} from '../5-dtos/comments.types';
import { CommentsQueryRepository } from '../2-repositories/query/comments.query.repository';
import { PostsRepository } from '../2-repositories/posts.repository';
import { PostsMainType } from '../5-dtos/posts.types';
import { ObjectId } from 'mongodb';
import { UsersRepository } from '../2-repositories/users.repository';
import { UsersMainType } from '../5-dtos/users.types';

@Injectable()
export class CommentsService {
  constructor(
    private commentsRepository: CommentsRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async returnAllComments() {
    return;
  }

  async updateComment(
    commentId: string,
    data: CommentsCreateUpdateValidate,
  ): Promise<boolean> {
    const commentDto: CommentsUpdateWith_id = {
      _id: commentId,
      content: data.content,
    };
    return this.commentsRepository.updateSaveComment(commentDto);
  }

  async deleteComment(commentId: string): Promise<boolean> {
    return this.commentsRepository.deleteComment(commentId);
  }

  async createCommentForPost(
    postId: string,
    dto: CommentsCreateUpdateValidate,
    userId: string,
  ) {
    const post: PostsMainType | null =
      await this.postsRepository.findPostById(postId);
    if (!post) {
      return null;
    }
    const user: UsersMainType | null =
      await this.usersRepository.findUserById(userId);

    if (!user) {
      return null;
    }
    const newComment: CommentsMainType = {
      _id: new ObjectId(),
      content: dto.content,
      commentatorInfo: {
        userId: user?._id,
        userLogin: user?.login,
      },
      createdAt: new Date().toISOString(),
      postId: postId,
    };

    const commentId: string | null =
      await this.commentsRepository.createSaveComment(newComment);

    if (!commentId) {
      return null;
    }
    return this.commentsQueryRepository.returnCommentById(commentId);
  }
}
