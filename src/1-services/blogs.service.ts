import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../2-repositories/blogs.repository';
import { ObjectId } from 'mongodb';
import { BlogsCreateUpdateWith_id, BlogsMainType } from '../5-dtos/blog.types';
import { BlogsCreateUpdateValid } from '../7-config/validation-pipes/blogs.pipes';

@Injectable()
export class BlogsService {
  constructor(private blogsRepository: BlogsRepository) {}

  async createBlog(dto: BlogsCreateUpdateValid): Promise<string | null> {
    const newBlog: BlogsMainType = {
      _id: new ObjectId(),
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };

    return this.blogsRepository.createSaveBlog(newBlog);
  }

  async updateBlog(
    blogId: string,
    dto: BlogsCreateUpdateValid,
  ): Promise<boolean> {
    const newBlogDto: BlogsCreateUpdateWith_id = {
      _id: blogId,
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    };
    return this.blogsRepository.updateSaveBlog(newBlogDto);
  }

  async deleteBlog(blogId: string): Promise<boolean> {
    return await this.blogsRepository.deleteBlog(blogId);
  }
}
