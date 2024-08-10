import { Injectable } from '@nestjs/common';
import {
  UsersGetInfoAboutMeType,
  UsersMainType,
  UsersViewType,
} from '../5-dtos/users.types';
import { BcryptAdapter } from '../4-adapters/bcrypt.adapter';
import { ObjectId } from 'mongodb';
import { UsersRepository } from '../2-repositories/users.repository';
import { UsersCreateValid } from '../7-config/validation-pipes/users.pipes';
import {
  ExceptionsNames,
  ResponseToControllersHelper,
} from '../6-helpers/response.to.controllers.helper';
import { UsersQueryRepository } from '../2-repositories/query/users.query.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly bcryptAdapter: BcryptAdapter,
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}
  async createUser(
    dto: UsersCreateValid,
  ): Promise<ResponseToControllersHelper> {
    const passInfo = await this.bcryptAdapter.passwordHash(dto.password);

    const user: UsersMainType = {
      _id: new ObjectId(),
      login: dto.login,
      email: dto.email,
      passwordSalt: passInfo.passwordSalt,
      passwordHash: passInfo.passwordHash,
      createdAt: new Date().toISOString(),
      emailConfirmation: {
        confirmationCode: 'SuperUserCode',
        expirationDate: new Date().toISOString(),
        isConfirmed: true,
      },
      passwordChanging: {
        setPasswordCode: 'none',
        expirationDate: 'none',
      },
    };
    const idOfCreatedUser: string | null =
      await this.usersRepository.createSaveUser(user);

    if (!idOfCreatedUser) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.BadRequest_400,
      );
    }

    const resultUserView: ResponseToControllersHelper =
      await this.usersQueryRepository.returnViewUserById(idOfCreatedUser);

    if (!resultUserView.responseData) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.BadRequest_400,
      );
    }
    return new ResponseToControllersHelper(
      false,
      undefined,
      resultUserView.responseData,
    );
  }

  async deleteUser(userId: string): Promise<ResponseToControllersHelper> {
    const user: UsersMainType | null =
      await this.usersRepository.findUserById(userId);
    if (!user) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.NotFound_404,
      );
    }

    const deleteResult: boolean = await this.usersRepository.deleteUser(userId);
    if (!deleteResult) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.BadRequest_400,
      );
    }

    return new ResponseToControllersHelper(false);
  }
  async getInformationAboutMe(
    userId: string,
  ): Promise<ResponseToControllersHelper> {
    const user: UsersMainType | null =
      await this.usersRepository.findUserById(userId);

    if (!user) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.BadRequest_400,
      );
    }
    const data: UsersGetInfoAboutMeType = {
      email: user.email,
      login: user.login,
      userId: user._id,
    };

    return new ResponseToControllersHelper(false, undefined, data);
  }
}
