import { Injectable } from '@nestjs/common';
import { UsersGetInfoAboutMeType, UsersMainType } from '../5-dtos/users.types';
import { BcryptAdapter } from '../4-adapters/bcrypt.adapter';
import { ObjectId } from 'mongodb';
import { UsersRepository } from '../2-repositories/users.repository';
import { UsersCreateValid } from '../7-config/validation-pipes/users.pipes';

@Injectable()
export class UsersService {
  constructor(
    private bcryptAdapter: BcryptAdapter,
    private usersRepository: UsersRepository,
  ) {}
  async createUser(dto: UsersCreateValid): Promise<string | null> {
    const passInfo = await this.bcryptAdapter.passwordHash(dto.password);

    const user: UsersMainType = {
      _id: new ObjectId(),
      login: dto.login,
      email: dto.email,
      passwordSalt: passInfo.passwordSalt,
      passwordHash: passInfo.passwordHash,
      createdAt: new Date().toISOString(),
      emailConfirmation: {
        confirmationCode: 'SuperUs erCode',
        expirationDate: new Date().toISOString(),
        isConfirmed: true,
      },
    };
    return this.usersRepository.createSaveUser(user);
  }

  async deleteUser(userId: string): Promise<boolean> {
    return this.usersRepository.deleteUser(userId);
  }
  async getInformationAboutMe(
    userId: string,
  ): Promise<UsersGetInfoAboutMeType | null> {
    const user: UsersMainType | null =
      await this.usersRepository.findUserById(userId);

    if (!user) {
      return null;
    }
    return {
      email: user.email,
      login: user.login,
      userId: user._id,
    };
  }
}
