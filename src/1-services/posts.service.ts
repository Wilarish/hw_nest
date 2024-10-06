import { Injectable } from '@nestjs/common';
import { PostsCreateUpdateWith_id, PostsMainType } from '../5-dtos/posts.types';
import { PostsRepository } from '../2-repositories/posts.repository';
import { ObjectId } from 'mongodb';
import { BlogsRepository } from '../2-repositories/blogs.repository';
import {
  ExceptionsNames,
  ResponseToControllersHelper,
} from '../6-helpers/response.to.controllers.helper';
import { PostsCreateUpdateValidate } from '../7-common/validation-pipes/posts.pipes';

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async createPost(
    postDto: PostsCreateUpdateValidate,
  ): Promise<ResponseToControllersHelper> {
    const foundBlog = await this.blogsRepository.findBlogById(
      postDto.blogId.toString(),
    );
    if (!foundBlog) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.BadRequest_400,
      );
    }

    const post: PostsMainType = {
      _id: new ObjectId(),
      title: postDto.title,
      shortDescription: postDto.shortDescription,
      content: postDto.content,
      blogId: new ObjectId(postDto.blogId),
      blogName: foundBlog.name,
      createdAt: new Date().toISOString(),
    };
    await this.postsRepository.createSavePost(post);

    return new ResponseToControllersHelper(
      false,
      undefined,
      post._id.toString(),
    );
  }

  async updatePost(
    postId: string,
    dto: PostsCreateUpdateValidate,
  ): Promise<ResponseToControllersHelper> {
    const post = await this.postsRepository.findPostById(postId);
    if (!post) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.NotFound_404,
      );
    }

    const newPostDto: PostsCreateUpdateWith_id = {
      _id: new ObjectId(postId),
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
    };
    await this.postsRepository.updateSavePost(newPostDto);

    return new ResponseToControllersHelper(false);
  }
  async deletePost(posId: string): Promise<ResponseToControllersHelper> {
    const deleteResult = await this.postsRepository.deletePost(posId);

    if (!deleteResult) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.NotFound_404,
      );
    }
    return new ResponseToControllersHelper(false);
  }
}
