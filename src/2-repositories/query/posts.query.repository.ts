import { Injectable } from '@nestjs/common';

import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { PostsMainClass, PostsModelType } from '../../3-schemas/posts.schema';
import { PostsViewType } from '../../5-dtos/posts.types';
import {
  ExtendedLikesPostsView,
  LikesMainType,
  likeStatuses,
} from '../../5-dtos/likes.types';
import {
  DefaultPaginationType,
  Paginated,
} from '../../5-dtos/pagination.types';
import { LikesRepository } from '../likes.repository';
import { RatesHelper } from '../../6-helpers/rates.helper';
import { getDefaultPagination } from '../../6-helpers/pagination.helpers';
import {
  ExceptionsNames,
  ResponseToControllersHelper,
} from '../../6-helpers/response.to.controllers.helper';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(PostsMainClass.name) private postsModel: PostsModelType,
    private readonly likesRepository: LikesRepository,
    private readonly ratesHelper: RatesHelper,
  ) {}

  async queryFindPaginatedPosts(
    params: any,
    userId?: string,
  ): Promise<ResponseToControllersHelper> {
    const pagination: DefaultPaginationType = getDefaultPagination(params);
    const [itemsDb, totalCount] = await Promise.all([
      this.postsModel
        .find({})
        .select({ __v: 0 })
        .sort({ [pagination.sortBy]: pagination.sortDirection })
        .skip(pagination.skip)
        .limit(pagination.pageSize)
        .lean(),

      this.postsModel.countDocuments(),
    ]);

    const pagesCount = Math.ceil(totalCount / pagination.pageSize);

    const items: PostsViewType[] = await this.ratesHelper.RateHelpPostsArr(
      itemsDb,
      userId,
    );

    const responseData: Paginated<PostsViewType> = {
      pagesCount,
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount,
      items,
    };
    return new ResponseToControllersHelper(false, undefined, responseData);
  }
  async returnViewPostById(
    postId: string,
    userId?: string,
  ): Promise<ResponseToControllersHelper> {
    const post = await this.postsModel.findById(new ObjectId(postId));
    if (!post) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.NotFound_404,
      );
    }

    const rates: LikesMainType[] =
      await this.likesRepository.getAllSortedRatesForPostById(postId);
    const extendedLikesInfo: ExtendedLikesPostsView =
      this.ratesHelper.RateHelpPosts(rates, userId);

    const responseData = {
      id: post._id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo,
    };
    return new ResponseToControllersHelper(false, undefined, responseData);
  }
}
