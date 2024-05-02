import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { LikesMainType, likeTypes } from '../5-dtos/likes.types';
import { Model } from 'mongoose';

@Schema()
export class LikesMainClass {
  @Prop({ required: true })
  likeType: likeTypes;

  @Prop({ required: true })
  commentOrPostId: ObjectId;

  @Prop({ required: true })
  userId: ObjectId;

  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  rate: string;

  static async tryFindAndUpdateRate(
    commentId: string,
    userId: string,
    likeStatus: string,
    model: Model<LikesMainClass>,
  ) {
    let result;
    try {
      result = await model.updateOne(
        {
          commentOrPostId: new ObjectId(commentId),
          userId: new ObjectId(userId),
        },
        { rate: likeStatus },
      );
    } catch (err) {
      return false;
    }
    return result.matchedCount === 1;
  }
}

export interface LikesModelStaticsType {
  tryFindAndUpdateRate: (
    commentId: string,
    userId: string,
    likeStatus: string,
    model: Model<LikesMainClass>,
  ) => Promise<boolean>;
}
export const LikesSchema = SchemaFactory.createForClass(LikesMainClass);
export type LikesModelType = LikesModelStaticsType & Model<LikesMainClass>;

LikesSchema.statics.tryFindAndUpdateRate = LikesMainClass.tryFindAndUpdateRate;
