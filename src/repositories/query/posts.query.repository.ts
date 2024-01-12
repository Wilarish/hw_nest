import { Injectable } from '@nestjs/common';

import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { PostsMainClass, PostsModelType } from '../../schemas/posts.schema';
import { PostsViewType } from '../../types/posts.types';
import { likeStatuses } from '../../types/likes.types';
import { DefaultPaginationType, Paginated } from '../../types/pagination.types';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(PostsMainClass.name) private postsModel: PostsModelType,
  ) {}

  async queryFindPaginatedPosts(
    pagination: DefaultPaginationType,
    userId: string | undefined,
  ): Promise<Paginated<PostsViewType>> {
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

    //const items: PostsViewType[] = await RateHelpPostsArr(itemsDb, userId);

    const items = itemsDb.map((post): PostsViewType => {
      return {
        id: post._id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: likeStatuses.None,
          newestLikes: [],
        },
      };
    });

    return {
      pagesCount,
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount,
      items,
    };
  }
  async returnViewPostById(id: string): Promise<PostsViewType | null> {
    const post = await this.postsModel.findById(new ObjectId(id));
    if (!post) return null;
    return {
      id: post._id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: likeStatuses.None,
        newestLikes: [],
      },
    };
  }
}
