import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentsMainClass,
  CommentsModelType,
} from '../../3-schemas/comments.schema';
import { likeStatuses } from '../../5-dtos/likes.types';
import { CommentsViewType } from '../../5-dtos/comments.types';
import { ObjectId } from 'mongodb';
import {
  DefaultPaginationType,
  Paginated,
} from '../../5-dtos/pagination.types';
import { PostsViewType } from '../../5-dtos/posts.types';
import { PostsQueryRepository } from './posts.query.repository';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(CommentsMainClass.name)
    private commentsModel: CommentsModelType,
    private postsQueryRepo: PostsQueryRepository,
  ) {}

  async returnQueryComments(
    pagination: DefaultPaginationType,
    postId: string,
    userId: string | undefined,
  ): Promise<Paginated<CommentsViewType> | null> {
    const post: PostsViewType | null =
      await this.postsQueryRepo.returnViewPostById(postId);

    if (!post) return null;

    const filter = { postId: postId };

    const [itemsDb, totalCount] = await Promise.all([
      this.commentsModel
        .find(filter)
        .select({ __v: 0, postId: 0 })
        .sort({ [pagination.sortBy]: pagination.sortDirection })
        .skip(pagination.skip)
        .limit(pagination.pageSize)
        .lean(),

      this.commentsModel.countDocuments(filter),
    ]);

    const pagesCount = Math.ceil(totalCount / pagination.pageSize);
    // const items: CommentsViewType[] = await RateHelpCommentsArr(
    //   itemsDb,
    //   userId,
    // );
    const items: CommentsViewType[] = itemsDb.map(
      (comment): CommentsViewType => {
        return {
          id: comment._id,
          content: comment.content,
          commentatorInfo: comment.commentatorInfo,
          createdAt: comment.createdAt,
          likesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: likeStatuses.None,
          },
        };
      },
    );

    return {
      pagesCount,
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount,
      items,
    };
  }
  async returnCommentById(commId: string): Promise<CommentsViewType | null> {
    const commentsDb = await this.commentsModel.findById(new ObjectId(commId));
    if (!commentsDb) return null;

    return {
      id: commentsDb._id,
      content: commentsDb.content,
      commentatorInfo: commentsDb.commentatorInfo,
      createdAt: commentsDb.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: likeStatuses.None,
      },
    };
  }
}
