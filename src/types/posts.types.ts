import { ObjectId } from 'mongodb';
import { ExtendedLikesPostsView } from './likes.types';

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

export type PostsCreateUpdate = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: ObjectId;
};

export type PostsCreateUpdateWith_id = PostsCreateUpdate & {
  _id: ObjectId;
};
