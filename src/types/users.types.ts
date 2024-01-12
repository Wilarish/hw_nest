import { ObjectId } from 'mongodb';

export type UsersViewType = {
  id: ObjectId;
  login: string;
  email: string;
  createdAt: string;
};

export type UsersMainType = {
  _id: ObjectId;
  login: string;
  email: string;
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
  emailConfirmation: ConfirmationEmailType;
};

export type ConfirmationEmailType = {
  confirmationCode: string;
  expirationDate: string;
  isConfirmed: boolean;
};

export type UsersCreate = {
  login: string;
  password: string;
  email: string;
};
