import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { BlogsMainClass, BlogsModelType } from '../schemas/blogs.schema';
import { BlogsCreateUpdateWith_id, BlogsMainType } from '../types/blog.types';
import { PostsMainClass, PostsModelType } from '../schemas/posts.schema';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(BlogsMainClass.name) private blogsModel: BlogsModelType,
    @InjectModel(PostsMainClass.name) private postsModel: PostsModelType,
  ) {}
  async createSaveBlog(blog: BlogsMainType): Promise<string | null> {
    return this.blogsModel.createSaveBlog(blog, this.blogsModel);
  }
  async updateSaveBlog(blogDto: BlogsCreateUpdateWith_id): Promise<boolean> {
    await this.postsModel.updatePost_blogName_(blogDto, this.postsModel);
    return this.blogsModel.updateSaveBlog(blogDto, this.blogsModel);
  }
  async findBlogById(id: string) {
    return this.blogsModel.findOne({ _id: new ObjectId(id) });
  }

  async deleteBlog(id: string): Promise<boolean> {
    const result = await this.blogsModel.findOneAndDelete({
      _id: new ObjectId(id),
    });
    if (!result) return false;

    return result._id.toString() === id;
  }

  async deleteAllBlogs() {
    await this.blogsModel.deleteMany();
    return;
  }
}
