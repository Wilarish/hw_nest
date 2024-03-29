import { Injectable } from '@nestjs/common';
import { PostsCreateUpdateWith_id, PostsMainType } from '../5-dtos/posts.types';
import { PostsRepository } from '../2-repositories/posts.repository';
import { ObjectId } from 'mongodb';
import { BlogsRepository } from '../2-repositories/blogs.repository';
import { PostsCreateUpdateValidate } from '../7-config/validation-pipes/posts.pipes';

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async createPost(postDto: PostsCreateUpdateValidate): Promise<string | null> {
    const foundBlog = await this.blogsRepository.findBlogById(
      postDto.blogId.toString(),
    );
    if (!foundBlog) return null;

    const post: PostsMainType = {
      _id: new ObjectId(),
      title: postDto.title,
      shortDescription: postDto.shortDescription,
      content: postDto.content,
      blogId: new ObjectId(postDto.blogId),
      blogName: foundBlog.name,
      createdAt: new Date().toISOString(),
    };
    //console.log(post);
    return this.postsRepository.createSavePost(post);
  }

  async updatePost(
    postId: string,
    dto: PostsCreateUpdateValidate,
  ): Promise<boolean> {
    const newPostDto: PostsCreateUpdateWith_id = {
      _id: new ObjectId(postId),
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
    };
    return this.postsRepository.updateSavePost(newPostDto);
  }
  async deletePost(posId: string): Promise<boolean> {
    return await this.postsRepository.deletePost(posId);
  }
}
