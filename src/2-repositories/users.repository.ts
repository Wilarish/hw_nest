import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UsersMainClass, UsersModelType } from '../3-schemas/users.scema';
import { UsersMainType } from '../5-dtos/users.types';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(UsersMainClass.name) private usersModel: UsersModelType,
  ) {}

  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UsersMainType | null> {
    return this.usersModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  }
  async findUserById(userId: string): Promise<UsersMainType | null> {
    return this.usersModel.findById(new ObjectId(userId));
  }
  async createSaveUser(user: UsersMainType): Promise<string | null> {
    return this.usersModel.createSaveUser(user, this.usersModel);
  }
  async deleteUser(userId: string): Promise<boolean> {
    const result = await this.usersModel.findOneAndDelete({
      _id: new ObjectId(userId),
    });
    if (!result) return false;

    return true;
  }

  async deleteAllUsers() {
    await this.usersModel.deleteMany();
  }

  async findUserByConfirmationCode(code: string) {
    return this.usersModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
  }

  async updateConfirmation(userId: string): Promise<boolean> {
    const result = await this.usersModel.updateOne(
      { _id: new ObjectId(userId) },
      { 'emailConfirmation.isConfirmed': true },
    );

    return result.modifiedCount === 1;
  }
  async updateConfirmationCode(userId: string, code: string): Promise<boolean> {
    const result = await this.usersModel.updateOne(
      { _id: new ObjectId(userId) },
      { 'emailConfirmation.confirmationCode': code },
    );

    return result.modifiedCount === 1;
  }

  async changeHashSaltPasswordChanging(
    userId: string,
    hash: string,
    salt: string,
  ) {
    const result = await this.usersModel.updateOne(
      { _id: new ObjectId(userId) },
      {
        passwordHash: hash,
        passwordSalt: salt,
        'passwordChanging.setPasswordCode': 'none',
        'passwordChanging.expirationDate': 'none',
      },
    );
    return result.modifiedCount === 1;
  }

  async createChangePasswordCode(
    userId: string,
    changeCode: string,
    expirationDate: string,
  ) {
    const result = await this.usersModel.updateOne(
      { _id: new ObjectId(userId) },
      {
        'passwordChanging.setPasswordCode': changeCode,
        'passwordChanging.expirationDate': expirationDate,
      },
    );
    return result.modifiedCount === 1;
  }
  async findUserByChangePasswordCode(changeCode: string) {
    return this.usersModel.findOne({
      'passwordChanging.setPasswordCode': changeCode,
    });
  }
}
