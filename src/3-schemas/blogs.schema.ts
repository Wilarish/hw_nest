import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BlogsCreateUpdateWith_id, BlogsMainType } from '../5-dtos/blog.types';
import { Model } from 'mongoose';

@Schema()
export class BlogsMainClass {
  @Prop({ required: true })
  _id: ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  websiteUrl: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  isMembership: boolean;

  static async createSaveBlog(
    blog: BlogsMainType,
    model: Model<BlogsMainClass>,
  ): Promise<string | null> {
    const newBlog = new model();

    newBlog._id = blog._id;
    newBlog.name = blog.name;
    newBlog.description = blog.description;
    newBlog.websiteUrl = blog.websiteUrl;
    newBlog.createdAt = blog.createdAt;
    newBlog.isMembership = blog.isMembership;

    // const result = await newBlog.save();
    // return result.
    try {
      await newBlog.save();
      return newBlog._id.toString();
    } catch (err) {
      return null;
    }
  }

  static async updateSaveBlog(
    blogDto: BlogsCreateUpdateWith_id,
    model: Model<BlogsMainClass>,
  ): Promise<boolean> {
    const dbBlog = await model.findById(new ObjectId(blogDto._id));

    if (!dbBlog) return false;

    dbBlog.websiteUrl = blogDto.websiteUrl;
    dbBlog.name = blogDto.name;
    dbBlog.description = blogDto.description;

    try {
      await dbBlog.save();
      return true;
    } catch (err) {
      return false;
    }
  }
}

export interface BlogsModelStaticsType {
  //почему тут не ставится async ?
  createSaveBlog: (
    blog: BlogsMainType,
    model: Model<BlogsMainClass>,
  ) => Promise<string | null>;

  updateSaveBlog: (
    blog: BlogsCreateUpdateWith_id,
    model: Model<BlogsMainClass>,
  ) => Promise<boolean>;
}

export const BlogsSchema = SchemaFactory.createForClass(BlogsMainClass);
export type BlogsModelType = Model<BlogsMainClass> & BlogsModelStaticsType;

BlogsSchema.statics.createSaveBlog = BlogsMainClass.createSaveBlog;
BlogsSchema.statics.updateSaveBlog = BlogsMainClass.updateSaveBlog;
