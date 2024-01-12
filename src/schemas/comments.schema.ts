import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { CommentsMainType } from '../types/comments.types';
import { Model } from 'mongoose';

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
  ) {
    const newComment = new model();

    newComment._id = comment._id;
    newComment.content = comment.content;
    newComment.commentatorInfo = comment.commentatorInfo;
    newComment.createdAt = comment.createdAt;
    newComment.postId = comment.postId;

    // const result = await newBlog.save();
    // return result.
    try {
      await newComment.save();
      return newComment._id.toString();
    } catch (err) {
      return null;
    }
  }
}

export interface CommentsModelStaticsType {
  createSaveComment: (
    user: CommentsMainType,
    model: Model<CommentsMainClass>,
  ) => Promise<string | null>;
}
export const CommentsSchema = SchemaFactory.createForClass(CommentsMainClass);
export type CommentsModelType = Model<CommentsMainClass> &
  CommentsModelStaticsType;

CommentsSchema.statics.createSaveComment = CommentsMainClass.createSaveComment;
