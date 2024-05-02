import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LikesMainClass, LikesModelType } from '../3-schemas/likes.schema';
import { ObjectId } from 'mongodb';
import { LikesMainType } from '../5-dtos/likes.types';

@Injectable()
export class LikesRepository {
  constructor(
    @InjectModel(LikesMainClass.name)
    private readonly likesModel: LikesModelType,
  ) {}

  async tryFindAndUpdateRate(
    commentId: string,
    userId: string,
    likeStatus: string,
  ): Promise<boolean> {
    return this.likesModel.tryFindAndUpdateRate(
      commentId,
      userId,
      likeStatus,
      this.likesModel,
    );
  }

  async addRate(rate: LikesMainType): Promise<boolean> {
    await this.likesModel.create(rate);
    return true;
  }
  async getAllCommentsRates(): Promise<LikesMainType[]> {
    return this.likesModel.find({ likeType: 'Comment' }).lean();
  }
  async getCommentRatesById(commentId: string): Promise<LikesMainType[]> {
    return this.likesModel
      .find({
        likeType: 'Comment',
        commentOrPostId: new ObjectId(commentId),
      })
      .lean();
  }
  async getAllSortedRatesForPostById(postId: string): Promise<LikesMainType[]> {
    return this.likesModel
      .find({
        likeType: 'Post',
        commentOrPostId: new ObjectId(postId),
      })
      .sort({ createdAt: -1 })
      .lean();
  }

  async deleteAllRates() {
    await this.likesModel.deleteMany({});
  }
}
