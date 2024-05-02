import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  CommentsMainClass,
  CommentsModelType,
} from '../3-schemas/comments.schema';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentsMainType,
  CommentsUpdateWith_id,
} from '../5-dtos/comments.types';
import { ObjectId } from 'mongodb';
import { CommentsCreateUpdateValidate } from '../7-config/validation-pipes/comments.pipes';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(CommentsMainClass.name)
    private readonly commentsModel: CommentsModelType,
  ) {}

  async deleteAllComments() {
    await this.commentsModel.deleteMany({});
  }

  async updateSaveComment(commentDto: CommentsUpdateWith_id): Promise<boolean> {
    return this.commentsModel.updateSaveComment(commentDto, this.commentsModel);
  }

  async deleteComment(commentId: string): Promise<boolean> {
    const result = await this.commentsModel.deleteOne({
      _id: new ObjectId(commentId),
    });
    return result.deletedCount === 1;
  }

  async createSaveComment(comment: CommentsMainType) {
    return this.commentsModel.createSaveComment(comment, this.commentsModel);
  }

  async findCommentById(commentId: string) {
    return this.commentsModel.findById(new ObjectId(commentId));
  }
}
