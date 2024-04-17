import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import {
  CommentsMainType,
  CommentsUpdateWith_id,
} from '../5-dtos/comments.types';
import { Model } from 'mongoose';
import { CommentsCreateUpdateValidate } from '../7-config/validation-pipes/comments.pipes';

@Schema()
class CommentatorInfo {
  @Prop({ required: true })
  userId: ObjectId;

  @Prop({ required: true })
  userLogin: string;
}
@Schema()
export class CommentsMainClass {
  @Prop({ required: true })
  _id: ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  commentatorInfo: CommentatorInfo;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  postId: string;

  static async createSaveComment(
    comment: CommentsMainType,
    model: Model<CommentsMainClass>,
  ): Promise<string | null> {
    const newComment = new model();

    newComment._id = comment._id;
    newComment.content = comment.content;
    newComment.commentatorInfo = comment.commentatorInfo;
    newComment.createdAt = comment.createdAt;
    newComment.postId = comment.postId;

    try {
      await newComment.save();
      return newComment._id.toString();
    } catch (err) {
      return null;
    }
  }
  static async updateSaveComment(
    commentDto: CommentsUpdateWith_id,
    model: Model<CommentsMainClass>,
  ): Promise<boolean> {
    const comment = await model.findById(new ObjectId(commentDto._id));
    if (!comment) {
      return false;
    }

    comment.content = commentDto.content;

    try {
      await comment.save();
      return true;
    } catch (err) {
      return false;
    }
  }
}

export interface CommentsModelStaticsType {
  createSaveComment: (
    comment: CommentsMainType,
    model: Model<CommentsMainClass>,
  ) => Promise<string | null>;
  updateSaveComment: (
    commentDto: CommentsUpdateWith_id,
    model: Model<CommentsMainClass>,
  ) => Promise<boolean>;
}
export const CommentsSchema = SchemaFactory.createForClass(CommentsMainClass);
export type CommentsModelType = Model<CommentsMainClass> &
  CommentsModelStaticsType;

CommentsSchema.statics.createSaveComment = CommentsMainClass.createSaveComment;
CommentsSchema.statics.updateSaveComment = CommentsMainClass.updateSaveComment;
