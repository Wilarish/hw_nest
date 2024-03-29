import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { UsersMainType } from '../5-dtos/users.types';
import { Model } from 'mongoose';

@Schema({ _id: false })
class EmailConfirmationClass {
  @Prop({ required: true })
  confirmationCode: string;

  @Prop({ required: true })
  expirationDate: string;

  @Prop({ required: true })
  isConfirmed: boolean;
}
@Schema()
export class UsersMainClass {
  @Prop({ required: true })
  _id: ObjectId;

  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  passwordSalt: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  emailConfirmation: EmailConfirmationClass;

  static async createSaveUser(
    user: UsersMainType,
    model: Model<UsersMainClass>,
  ): Promise<string | null> {
    const newUser = new model();

    newUser._id = user._id;
    newUser.login = user.login;
    newUser.email = user.email;
    newUser.passwordSalt = user.passwordSalt;
    newUser.passwordHash = user.passwordHash;
    newUser.createdAt = user.createdAt;
    newUser.emailConfirmation = user.emailConfirmation;

    try {
      await newUser.save();
      return newUser._id.toString();
    } catch (err) {
      return null;
    }
  }
}

export interface UsersModelStaticsType {
  createSaveUser: (
    user: UsersMainType,
    model: Model<UsersMainClass>,
  ) => Promise<string | null>;
}
export const UsersSchema = SchemaFactory.createForClass(UsersMainClass);
export type UsersModelType = Model<UsersMainClass> & UsersModelStaticsType;

UsersSchema.statics.createSaveUser = UsersMainClass.createSaveUser;
