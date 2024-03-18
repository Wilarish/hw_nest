import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { BlogsCreateUpdateWith_id } from '../5-dtos/blog.types';
import { Model } from 'mongoose';
import { PostsCreateUpdateWith_id, PostsMainType } from '../5-dtos/posts.types';

@Schema()
export class PostsMainClass {
  @Prop({ required: true })
  _id: ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: ObjectId, required: true })
  blogId: ObjectId;

  @Prop({ required: true })
  blogName: string;

  @Prop({ required: true })
  createdAt: string;

  static async createSavePost(
    post: PostsMainType,
    model: Model<PostsMainClass>,
  ): Promise<string | null> {
    const newPost = new model();

    newPost._id = post._id;
    newPost.title = post.title;
    newPost.shortDescription = post.shortDescription;
    newPost.content = post.content;
    newPost.createdAt = post.createdAt;
    newPost.blogName = post.blogName;
    newPost.blogId = post.blogId;

    // const result = await newBlog.save();
    // return result.
    try {
      await newPost.save();
      return newPost._id.toString();
    } catch (err) {
      return null;
    }
  }

  static async updateSavePost(
    postDto: PostsCreateUpdateWith_id,
    model: Model<PostsMainClass>,
  ): Promise<boolean> {
    const dbPost = await model.findById(new ObjectId(postDto._id));

    if (!dbPost) return false;

    dbPost.title = postDto.title;
    dbPost.shortDescription = postDto.shortDescription;
    dbPost.content = postDto.content;
    dbPost.blogId = postDto.blogId;

    try {
      await dbPost.save();
      return true;
    } catch (err) {
      return false;
    }
  }

  static async updatePost_blogName_(
    blogDto: BlogsCreateUpdateWith_id,
    model: Model<PostsMainClass>,
  ): Promise<boolean> {
    try {
      await model.updateMany(
        { blogId: blogDto._id },
        { blogName: blogDto.name },
      );
      return true;
    } catch (err) {
      return false;
    }
  }
}

export interface PostsModelStaticsType {
  //почему тут не ставится async ?
  createSavePost: (
    post: PostsMainType,
    model: Model<PostsMainClass>,
  ) => Promise<string | null>;

  updateSavePost: (
    postDto: PostsCreateUpdateWith_id,
    model: Model<PostsMainClass>,
  ) => Promise<boolean>;

  updatePost_blogName_: (
    blogDto: BlogsCreateUpdateWith_id,
    model: Model<PostsMainClass>,
  ) => Promise<boolean>;
}

export const PostsSchema = SchemaFactory.createForClass(PostsMainClass);
export type PostsModelType = Model<PostsMainClass> & PostsModelStaticsType;

PostsSchema.statics.createSavePost = PostsMainClass.createSavePost;
PostsSchema.statics.updateSavePost = PostsMainClass.updateSavePost;
PostsSchema.statics.updatePost_blogName_ = PostsMainClass.updatePost_blogName_;
