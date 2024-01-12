import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../repositories/blogs.repository';
import { ObjectId } from 'mongodb';
import {
  BlogsCreateUpdate,
  BlogsCreateUpdateWith_id,
  BlogsMainType,
} from '../types/blog.types';

@Injectable()
export class BlogsService {
  constructor(private blogsRepository: BlogsRepository) {}

  async createBlog(dto: BlogsCreateUpdate): Promise<string | null> {
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

  async updateBlog(blogId: string, dto: BlogsCreateUpdate): Promise<boolean> {
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
