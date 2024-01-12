import { Injectable } from '@nestjs/common';
import { UsersCreate, UsersMainType } from '../types/users.types';
import { BcryptAdapter } from '../adapters/bcrypt.adapter';
import { ObjectId } from 'mongodb';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(
    private hashAdapter: BcryptAdapter,
    private usersRepository: UsersRepository,
  ) {}
  async createUser(dto: UsersCreate): Promise<string | null> {
    const passInfo = await this.hashAdapter.passwordHash();

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
}
