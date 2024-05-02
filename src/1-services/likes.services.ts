import { Injectable } from '@nestjs/common';
import { LikesRepository } from '../2-repositories/likes.repository';
import { LikesMainType, likeTypes } from '../5-dtos/likes.types';
import { CommentsMainType } from '../5-dtos/comments.types';
import { PostsMainType } from '../5-dtos/posts.types';
import { UsersMainType } from '../5-dtos/users.types';
import { UsersRepository } from '../2-repositories/users.repository';
import { PostsRepository } from '../2-repositories/posts.repository';
import { CommentsRepository } from '../2-repositories/comments.repository';
import { ObjectId } from 'mongodb';
import {
  ExceptionsNames,
  ResponseToControllersHelper,
} from '../6-helpers/response.to.controllers.helper';

@Injectable()
export class LikesServices {
  constructor(
    private readonly likesRepository: LikesRepository,
    private readonly usersRepository: UsersRepository,
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async rateCommentOrPost(
    postOrCommentId: string,
    likeStatus: string,
    userId: string,
    likeType: string,
  ): Promise<ResponseToControllersHelper> {
    if (likeType === likeTypes[likeTypes.Comment]) {
      const comment: CommentsMainType | null =
        await this.commentsRepository.findCommentById(postOrCommentId);
      if (!comment) {
        return new ResponseToControllersHelper(
          true,
          ExceptionsNames.NotFound_404,
        );
      }
    }
    if (likeType === likeTypes[likeTypes.Post]) {
      const post: PostsMainType | null =
        await this.postsRepository.findPostById(postOrCommentId);
      if (!post) {
        return new ResponseToControllersHelper(
          true,
          ExceptionsNames.NotFound_404,
        );
      }
    }
    const user: UsersMainType | null =
      await this.usersRepository.findUserById(userId);
    if (!user) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.NotFound_404,
      );
    }

    const rate: boolean = await this.likesRepository.tryFindAndUpdateRate(
      postOrCommentId,
      userId,
      likeStatus,
    );

    const new_rate: LikesMainType = {
      likeType: likeTypes[likeType as keyof typeof likeTypes],
      commentOrPostId: new ObjectId(postOrCommentId),
      userId: new ObjectId(userId),
      login: user.login,
      createdAt: new Date().toISOString(),
      rate: likeStatus,
    };

    if (!rate) {
      await this.likesRepository.addRate(new_rate);
    }

    return new ResponseToControllersHelper(false);
  }
}
