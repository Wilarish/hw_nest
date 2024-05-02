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
import {
  ExceptionsNames,
  ResponseToControllersHelper,
} from '../6-helpers/response.to.controllers.helper';
import * as console from 'console';

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
    userId: string,
  ): Promise<ResponseToControllersHelper> {
    const commentDto: CommentsUpdateWith_id = {
      _id: commentId,
      content: data.content,
    };

    const commentFromDb =
      await this.commentsRepository.findCommentById(commentId);

    if (!commentFromDb) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.NotFound_404,
      );
    }

    if (userId !== commentFromDb.commentatorInfo.userId.toString()) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.Forbidden_403,
      );
    }

    await this.commentsRepository.updateSaveComment(commentDto);

    return new ResponseToControllersHelper(false);
  }

  async deleteComment(
    commentId: string,
    userId: string,
  ): Promise<ResponseToControllersHelper> {
    const commentDb = await this.commentsRepository.findCommentById(commentId);

    if (!commentDb) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.NotFound_404,
      );
    }
    if (userId !== commentDb.commentatorInfo.userId.toString()) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.Forbidden_403,
      );
    }

    const deletedResult: boolean =
      await this.commentsRepository.deleteComment(commentId);
    if (!deletedResult) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.BadRequest_400,
      );
    }

    return new ResponseToControllersHelper(false);
  }

  async createCommentForPost(
    postId: string,
    dto: CommentsCreateUpdateValidate,
    userId: string,
  ) {
    const post: PostsMainType | null =
      await this.postsRepository.findPostById(postId);
    if (!post) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.NotFound_404,
      );
    }
    const user: UsersMainType | null =
      await this.usersRepository.findUserById(userId);

    if (!user) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.BadRequest_400,
      );
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
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.BadRequest_400,
      );
    }
    return new ResponseToControllersHelper(false, undefined, commentId);
  }
}
