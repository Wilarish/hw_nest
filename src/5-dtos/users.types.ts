import { ObjectId } from 'mongodb';

export type UsersViewType = {
  id: ObjectId;
  login: string;
  email: string;
  createdAt: string;
};
export type UsersGetInfoAboutMeType = {
  userId: ObjectId;
  login: string;
  email: string;
};

export type UsersMainType = {
  _id: ObjectId;
  login: string;
  email: string;
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
  emailConfirmation: ConfirmationEmailType;
  passwordChanging: PasswordChanging;
};

export type ConfirmationEmailType = {
  confirmationCode: string;
  expirationDate: string;
  isConfirmed: boolean;
};
export type PasswordChanging = {
  setPasswordCode: string;
  expirationDate: string;
};
