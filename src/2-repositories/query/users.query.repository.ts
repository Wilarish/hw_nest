import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { UsersMainClass, UsersModelType } from '../../3-schemas/users.scema';
import { Paginated, UsersPaginationType } from '../../5-dtos/pagination.types';
import { UsersMainType, UsersViewType } from '../../5-dtos/users.types';
import { ObjectId } from 'mongodb';
import { getUsersPagination } from '../../6-helpers/pagination.helpers';
import {
  ExceptionsNames,
  ResponseToControllersHelper,
} from '../../6-helpers/response.to.controllers.helper';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(UsersMainClass.name) private usersModel: UsersModelType,
  ) {}
  async returnViewUsers(params: any): Promise<ResponseToControllersHelper> {
    const pagination: UsersPaginationType = getUsersPagination(params);

    const filter = {
      $or: [
        { login: { $regex: pagination.searchLoginTerm, $options: 'i' } },
        { email: { $regex: pagination.searchEmailTerm, $options: 'i' } },
      ],
    };

    const [itemsDb, totalCount] = await Promise.all([
      this.usersModel
        .find(filter)
        .sort({ [pagination.sortBy]: pagination.sortDirection })
        .skip(pagination.skip)
        .limit(pagination.pageSize)
        .lean(),

      this.usersModel.countDocuments(filter),
    ]);

    const pagesCount: number = Math.ceil(totalCount / pagination.pageSize);

    const items: UsersViewType[] = itemsDb.map((user): UsersViewType => {
      return {
        id: user._id,
        login: user.login,
        email: user.email,
        createdAt: user.createdAt,
      };
    });

    const responseData: Paginated<UsersViewType> = {
      pagesCount,
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount,
      items,
    };

    return new ResponseToControllersHelper(false, undefined, responseData);
  }

  async returnViewUserById(
    userId: string,
  ): Promise<ResponseToControllersHelper> {
    const userDb: UsersMainType | null = await this.usersModel.findById(
      new ObjectId(userId),
    );

    if (!userDb) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.NotFound_404,
      );
    }

    const responseData: UsersViewType = {
      id: userDb._id,
      login: userDb.login,
      email: userDb.email,
      createdAt: userDb.createdAt,
    };

    return new ResponseToControllersHelper(false, undefined, responseData);
  }
}
