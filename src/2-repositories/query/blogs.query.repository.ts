import { InjectModel } from '@nestjs/mongoose';
import { BlogsMainClass, BlogsModelType } from '../../3-schemas/blogs.schema';
import { ObjectId } from 'mongodb';
import { BlogsViewType } from '../../5-dtos/blog.types';
import {
  BlogsPaginationType,
  DefaultPaginationType,
  Paginated,
} from '../../5-dtos/pagination.types';
import { PostsViewType } from '../../5-dtos/posts.types';
import { PostsMainClass, PostsModelType } from '../../3-schemas/posts.schema';
import { likeStatuses } from '../../5-dtos/likes.types';
import { RatesHelper } from '../../6-helpers/rates.helper';
import {
  ExceptionsNames,
  ResponseToControllersHelper,
} from '../../6-helpers/response.to.controllers.helper';
import {
  getBlogsPagination,
  getDefaultPagination,
} from '../../6-helpers/pagination.helpers';

export class BlogsQueryRepository {
  constructor(
    @InjectModel(BlogsMainClass.name) private blogsModel: BlogsModelType,
    @InjectModel(PostsMainClass.name) private postsModel: PostsModelType,
    private readonly ratesHelper: RatesHelper,
  ) {}

  async returnViewPostsForBlogById(
    blogId: string,
    params: any,
    userId?: string,
  ): Promise<ResponseToControllersHelper> {
    const pagination = getDefaultPagination(params);

    const blogDb = await this.blogsModel.findById(new ObjectId(blogId));
    if (!blogDb) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.NotFound_404,
      );
    }

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

    const items: PostsViewType[] = await this.ratesHelper.RateHelpPostsArr(
      itemsDb,
      userId,
    );

    const data: Paginated<PostsViewType> = {
      pagesCount,
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount,
      items,
    };

    return new ResponseToControllersHelper(false, undefined, data);
  }
  async returnViewBlogById(
    blogId: string,
  ): Promise<ResponseToControllersHelper> {
    const blogDb = await this.blogsModel.findById(new ObjectId(blogId));
    if (!blogDb) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.NotFound_404,
      );
    }
    const data: BlogsViewType = {
      id: blogDb._id,
      name: blogDb.name,
      description: blogDb.description,
      websiteUrl: blogDb.websiteUrl,
      createdAt: blogDb.createdAt,
      isMembership: blogDb.isMembership,
    };

    return new ResponseToControllersHelper(false, undefined, data);
  }

  async returnAllViewBlogs(params: any): Promise<ResponseToControllersHelper> {
    const pagination: BlogsPaginationType = getBlogsPagination(params);

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

    const data: Paginated<BlogsViewType> = {
      pagesCount,
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount,
      items,
    };

    return new ResponseToControllersHelper(false, undefined, data);
  }
}
