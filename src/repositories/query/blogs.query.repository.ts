import { InjectModel } from '@nestjs/mongoose';
import { BlogsMainClass, BlogsModelType } from '../../schemas/blogs.schema';
import { ObjectId } from 'mongodb';
import { BlogsViewType } from '../../types/blog.types';
import {
  BlogsPaginationType,
  DefaultPaginationType,
  Paginated,
} from '../../types/pagination.types';
import { PostsViewType } from '../../types/posts.types';
import { PostsMainClass, PostsModelType } from '../../schemas/posts.schema';
import { likeStatuses } from '../../types/likes.types';

export class BlogsQueryRepository {
  constructor(
    @InjectModel(BlogsMainClass.name) private blogsModel: BlogsModelType,
    @InjectModel(PostsMainClass.name) private postsModel: PostsModelType,
  ) {}

  async returnViewPostsForBlogsById(
    blogId: string,
    pagination: DefaultPaginationType,
    //userId: string | undefined,
  ): Promise<Paginated<PostsViewType>> {
    const filter = { blogId: new ObjectId(blogId) };

    const [itemsDb, totalCount] = await Promise.all([
      this.postsModel
        .find(filter, { projection: { __v: 0 } })
        .sort({ [pagination.sortBy]: pagination.sortDirection })
        .skip(pagination.skip)
        .limit(pagination.pageSize)
        .lean(),

      this.postsModel.countDocuments(filter),
    ]);

    const pagesCount = Math.ceil(totalCount / pagination.pageSize);

    //const items: PostsViewType[] = await RateHelpPostsArr(itemsDb, userId);
    const items: PostsViewType[] = itemsDb.map((post) => {
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
  async returnViewBlogById(id: string): Promise<BlogsViewType | null> {
    const blog = await this.blogsModel.findById(new ObjectId(id));
    if (!blog) return null;
    return {
      id: blog._id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }

  async returnAllViewBlogs(
    pagination: BlogsPaginationType,
  ): Promise<Paginated<BlogsViewType>> {
    const filter = {
      name: { $regex: pagination.searchNameTerm, $options: 'i' },
    };

    const [itemsDb, totalCount] = await Promise.all([
      this.blogsModel
        .find(filter)
        .select({ __v: 0 })
        .sort({ [pagination.sortBy]: pagination.sortDirection })
        .skip(pagination.skip)
        .limit(pagination.pageSize)
        .lean(),

      this.blogsModel.countDocuments(filter),
    ]);

    const pagesCount = Math.ceil(totalCount / pagination.pageSize);

    const items: BlogsViewType[] = itemsDb.map((blog) => {
      return {
        id: blog._id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership,
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
}
