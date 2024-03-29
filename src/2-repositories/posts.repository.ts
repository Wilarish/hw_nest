import { PostsCreateUpdateWith_id, PostsMainType } from '../5-dtos/posts.types';
import { InjectModel } from '@nestjs/mongoose';
import { PostsMainClass, PostsModelType } from '../3-schemas/posts.schema';
import { ObjectId } from 'mongodb';

export class PostsRepository {
  constructor(
    @InjectModel(PostsMainClass.name) private postsModel: PostsModelType,
  ) {}
  async createSavePost(post: PostsMainType): Promise<string | null> {
    return this.postsModel.createSavePost(post, this.postsModel);
  }

  async updateSavePost(newPostDto: PostsCreateUpdateWith_id): Promise<boolean> {
    return this.postsModel.updateSavePost(newPostDto, this.postsModel);
  }
  async deletePost(postId: string): Promise<boolean> {
    const result = await this.postsModel.findOneAndDelete({
      _id: new ObjectId(postId),
    });
    if (!result) return false;

    return result._id.toString() === postId;
  }

  async deleteAllPosts() {
    await this.postsModel.deleteMany();
  }
}
