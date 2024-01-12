import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { UsersMainClass, UsersModelType } from '../../schemas/users.scema';
import { Paginated, UsersPaginationType } from '../../types/pagination.types';
import { UsersMainType, UsersViewType } from '../../types/users.types';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(UsersMainClass.name) private usersModel: UsersModelType,
  ) {}
  async returnViewUsers(
    pagination: UsersPaginationType,
  ): Promise<Paginated<UsersViewType>> {
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

    return {
      pagesCount,
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount,
      items,
    };
  }

  async returnViewUserById(id: string): Promise<UsersViewType | null> {
    const userDb: UsersMainType | null = await this.usersModel.findOne({
      id: new ObjectId(id),
    });

    if (!userDb) return null;

    return {
      id: userDb._id,
      login: userDb.login,
      email: userDb.email,
      createdAt: userDb.createdAt,
    };
  }
}
