import { ObjectId } from 'mongodb';
import { ExtendedLikesPostsView } from './likes.types';
import { PostsCreateUpdateValidate } from '../7-config/validation-pipes/posts.pipes';

export type PostsViewType = {
  id: ObjectId;
  title: string;
  shortDescription: string;
  content: string;
  blogId: ObjectId;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesPostsView;
};

export type PostsMainType = {
  _id: ObjectId;
  title: string;
  shortDescription: string;
  content: string;
  blogId: ObjectId;
  blogName: string;
  createdAt: string;
};

export type PostsCreateUpdateWith_id = PostsCreateUpdateValidate & {
  _id: ObjectId;
};
