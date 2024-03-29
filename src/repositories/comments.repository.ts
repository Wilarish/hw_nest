import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  CommentsMainClass,
  CommentsModelType,
} from '../3-schemas/comments.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(CommentsMainClass.name)
    private commentsModel: Model<CommentsModelType>,
  ) {}

  async returnAllComments() {
    return this.commentsModel.find({}, { __v: 0 });
  }

  async deleteAllComments() {
    await this.commentsModel.deleteMany({});
  }
}
