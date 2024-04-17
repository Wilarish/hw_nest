import { LikeInfoView } from './likes.types';
import { ObjectId } from 'mongodb';

export type CommentsViewType = {
  id: ObjectId;
  content: string;
  commentatorInfo: commentatorInfo;
  createdAt: string;
  likesInfo: LikeInfoView;
};
export type CommentsUpdateWith_id = {
  _id: string;
  content: string;
};

export type CommentsMainType = {
  _id: ObjectId;
  content: string;
  commentatorInfo: commentatorInfo;
  createdAt: string;
  postId: string;
};

type commentatorInfo = {
  userId: ObjectId;
  userLogin: string;
};
