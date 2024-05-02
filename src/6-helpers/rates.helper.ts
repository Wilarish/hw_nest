import { Injectable } from '@nestjs/common';
import { LikesRepository } from '../2-repositories/likes.repository';
import {
  ExtendedLikesPostsView,
  LikeInfoView,
  LikesMainType,
  likeStatuses,
  NewestPostLikes,
} from '../5-dtos/likes.types';
import { CommentsMainType, CommentsViewType } from '../5-dtos/comments.types';
import { PostsMainType, PostsViewType } from '../5-dtos/posts.types';

@Injectable()
export class RatesHelper {
  constructor(private readonly likesRepository: LikesRepository) {}

  async RateHelpComments(
    commentId: string,
    userId?: string,
  ): Promise<LikeInfoView> {
    const rates: LikesMainType[] =
      await this.likesRepository.getCommentRatesById(commentId);

    let likeStatus = 'None';

    let likesCount: number = 0;
    let dislikesCount: number = 0;

    rates.map((value: LikesMainType) => {
      if (value.rate === 'Like') likesCount++;
      if (value.rate === 'Dislike') dislikesCount++;
      if (userId && value.userId.toString() === userId) likeStatus = value.rate;
    });

    return {
      likesCount,
      dislikesCount,
      myStatus: likeStatuses[likeStatus as keyof typeof likeStatuses],
    };
  }

  async RateHelpCommentsArr(itemsDb: CommentsMainType[], userId?: string) {
    const rates: LikesMainType[] =
      await this.likesRepository.getAllCommentsRates();

    let likeStatus: string;
    let likesCount: number;
    let dislikesCount: number;

    const items = itemsDb.map((comment) => {
      likeStatus = 'None';
      likesCount = 0;
      dislikesCount = 0;

      rates.map((value: LikesMainType) => {
        if (value.commentOrPostId.toString() === comment._id.toString()) {
          if (value.rate === 'Like') likesCount++;
          if (value.rate === 'Dislike') dislikesCount++;
          if (userId && value.userId.toString() === userId)
            likeStatus = value.rate;
        }
      });

      const likesInfo: LikeInfoView = {
        likesCount,
        dislikesCount,
        myStatus: likeStatuses[likeStatus as keyof typeof likeStatuses],
      };

      return {
        id: comment._id,
        content: comment.content,
        commentatorInfo: comment.commentatorInfo,
        createdAt: comment.createdAt,
        likesInfo: likesInfo,
      };
    });

    return items;
  }
  RateHelpPosts(
    rates: LikesMainType[],
    userId?: string,
  ): ExtendedLikesPostsView {
    let likeStatus = 'None';

    const lastRates: NewestPostLikes[] = [];

    let likesCount: number = 0;
    let dislikesCount: number = 0;

    rates.map((value: LikesMainType) => {
      if (value.rate === 'Like' && lastRates.length < 3) {
        lastRates.push({
          addedAt: value.createdAt,
          userId: value.userId,
          login: value.login,
        });
      }
      if (value.rate === 'Like') likesCount++;
      if (value.rate === 'Dislike') dislikesCount++;
      if (userId && value.userId.toString() === userId) likeStatus = value.rate;
    });
    return {
      likesCount,
      dislikesCount,
      myStatus: likeStatuses[likeStatus as keyof typeof likeStatuses],
      newestLikes: lastRates,
    };
  }
  async RateHelpPostsArr(
    itemsDb: PostsMainType[],
    userId: string | undefined,
  ): Promise<PostsViewType[]> {
    let rates: LikesMainType[];

    const items: Promise<PostsViewType[]> = Promise.all(
      itemsDb.map(async (post: PostsMainType): Promise<PostsViewType> => {
        rates = await this.likesRepository.getAllSortedRatesForPostById(
          post._id.toString(),
        );

        const extendedLikesInfo: ExtendedLikesPostsView = this.RateHelpPosts(
          rates,
          userId,
        );

        return {
          id: post._id,
          title: post.title,
          shortDescription: post.shortDescription,
          content: post.content,
          blogId: post.blogId,
          blogName: post.blogName,
          createdAt: post.createdAt,
          extendedLikesInfo,
        };
      }),
    );

    return items;
  }
}
