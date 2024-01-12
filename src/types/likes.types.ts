import { ObjectId } from 'mongodb';

export enum likeStatuses {
  'Like' = 'Like',
  'Dislike' = 'Dislike',
  'None' = 'None',
}

export enum likeTypes {
  'Comment' = 'Comment',
  'Post' = 'Post',
}

export type LikeInfoView = {
  likesCount: number;
  dislikesCount: number;
  myStatus: likeStatuses;
};

export type LikesMainType = {
  likeType: likeTypes;
  commentOrPostId: ObjectId;
  userId: ObjectId;
  login: string;
  createdAt: string;
  rate: string;
};

export type NewestPostLikes = {
  addedAt: string;
  userId: ObjectId;
  login: string;
};

export type ExtendedLikesPostsView = {
  likesCount: number;
  dislikesCount: number;
  myStatus: likeStatuses;
  newestLikes: NewestPostLikes[];
};
