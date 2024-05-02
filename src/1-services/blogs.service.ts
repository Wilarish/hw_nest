import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BlogsRepository } from '../2-repositories/blogs.repository';
import { ObjectId } from 'mongodb';
import {
  BlogsCreateUpdateWith_id,
  BlogsMainType,
  BlogsViewType,
} from '../5-dtos/blog.types';
import { BlogsCreateUpdateValid } from '../7-config/validation-pipes/blogs.pipes';
import {
  ExceptionsNames,
  ResponseToControllersHelper,
} from '../6-helpers/response.to.controllers.helper';
import {
  PostsCreateInBlogsControllerValidate,
  PostsCreateUpdateValidate,
} from '../7-config/validation-pipes/posts.pipes';
import { PostsService } from './posts.service';

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsService: PostsService,
  ) {}

  async createBlog(
    dto: BlogsCreateUpdateValid,
  ): Promise<ResponseToControllersHelper> {
    const newBlog: BlogsMainType = {
      _id: new ObjectId(),
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };

    const idOfCreatedBlog: string | null =
      await this.blogsRepository.createSaveBlog(newBlog);
    if (!idOfCreatedBlog) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.BadRequest_400,
      );
    }

    return new ResponseToControllersHelper(false, undefined, idOfCreatedBlog);
  }

  async createPostForBlog(
    dto: PostsCreateInBlogsControllerValidate,
    blogId: string,
  ): Promise<ResponseToControllersHelper> {
    const blogDb = await this.blogsRepository.findBlogById(blogId);
    if (!blogDb) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.NotFound_404,
      );
    }

    const resultCreatePost: ResponseToControllersHelper =
      await this.postsService.createPost({
        title: dto.title,
        shortDescription: dto.shortDescription,
        content: dto.content,
        blogId: new ObjectId(blogId),
      });

    return new ResponseToControllersHelper(false, undefined, resultCreatePost);
  }

  async updateBlog(
    blogId: string,
    dto: BlogsCreateUpdateValid,
  ): Promise<ResponseToControllersHelper> {
    const blogDb = await this.blogsRepository.findBlogById(blogId);
    if (!blogDb) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.NotFound_404,
      );
    }

    const newBlogDto: BlogsCreateUpdateWith_id = {
      _id: blogId,
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    };
    const resultDb: boolean =
      await this.blogsRepository.updateSaveBlog(newBlogDto);

    if (!resultDb) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.BadRequest_400,
      );
    }
    return new ResponseToControllersHelper(false);
  }

  async deleteBlog(blogId: string): Promise<ResponseToControllersHelper> {
    const deleteResult: boolean = await this.blogsRepository.deleteBlog(blogId);
    if (!deleteResult) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.NotFound_404,
      );
    }

    return new ResponseToControllersHelper(false);
  }
}
