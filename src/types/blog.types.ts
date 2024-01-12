import { ObjectId } from 'mongodb';

export type BlogsMainType = {
  _id: ObjectId;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};

export type BlogsViewType = {
  id: ObjectId;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};

export type BlogsCreateUpdate = {
  name: string;
  description: string;
  websiteUrl: string;
};

export type BlogsCreateUpdateWith_id = {
  _id: string;
  name: string;
  description: string;
  websiteUrl: string;
};
