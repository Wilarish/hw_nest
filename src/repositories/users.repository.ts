import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UsersMainClass, UsersModelType } from '../schemas/users.scema';
import { UsersMainType } from '../types/users.types';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(UsersMainClass.name) private usersModel: UsersModelType,
  ) {}

  async createSaveUser(user: UsersMainType): Promise<string | null> {
    return this.usersModel.createSaveUser(user, this.usersModel);
  }
  async deleteUser(userId: string): Promise<boolean> {
    const result = await this.usersModel.findOneAndDelete({
      _id: new ObjectId(userId),
    });
    if (!result) return false;

    return result._id.toString() === userId;
  }

  async deleteAllUsers() {
    await this.usersModel.deleteMany();
  }
}
