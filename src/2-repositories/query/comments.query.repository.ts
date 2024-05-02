import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentsMainClass,
  CommentsModelType,
} from '../../3-schemas/comments.schema';
import { LikeInfoView, likeStatuses } from '../../5-dtos/likes.types';
import { CommentsViewType } from '../../5-dtos/comments.types';
import { ObjectId } from 'mongodb';
import {
  DefaultPaginationType,
  Paginated,
} from '../../5-dtos/pagination.types';
import { PostsViewType } from '../../5-dtos/posts.types';
import { PostsQueryRepository } from './posts.query.repository';
import { RatesHelper } from '../../6-helpers/rates.helper';
import { getDefaultPagination } from '../../6-helpers/pagination.helpers';
import {
  ExceptionsNames,
  ResponseToControllersHelper,
} from '../../6-helpers/response.to.controllers.helper';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(CommentsMainClass.name)
    private readonly commentsModel: CommentsModelType,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly ratesHelper: RatesHelper,
  ) {}

  async returnQueryComments(
    params: any,
    postId: string,
    userId?: string,
  ): Promise<ResponseToControllersHelper> {
    const pagination: DefaultPaginationType = getDefaultPagination(params);

    const post: ResponseToControllersHelper =
      await this.postsQueryRepository.returnViewPostById(postId);

    if (!post.responseData) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.NotFound_404,
      );
    }

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
    const items: CommentsViewType[] =
      await this.ratesHelper.RateHelpCommentsArr(itemsDb, userId);

    const responseData: Paginated<CommentsViewType> = {
      pagesCount,
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount,
      items,
    };
    return new ResponseToControllersHelper(false, undefined, responseData);
  }
  async returnCommentById(
    commentId: string,
    userId?: string,
  ): Promise<ResponseToControllersHelper> {
    const commentsDb = await this.commentsModel.findById(
      new ObjectId(commentId),
    );
    if (!commentsDb) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.NotFound_404,
      );
    }

    const likesInfo: LikeInfoView = await this.ratesHelper.RateHelpComments(
      commentId,
      userId,
    );

    const responseData: CommentsViewType = {
      id: commentsDb._id,
      content: commentsDb.content,
      commentatorInfo: commentsDb.commentatorInfo,
      createdAt: commentsDb.createdAt,
      likesInfo,
    };

    return new ResponseToControllersHelper(false, undefined, responseData);
  }
}
