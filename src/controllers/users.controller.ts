import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UsersCreate, UsersViewType } from '../types/users.types';
import { UsersQueryRepository } from '../repositories/query/users.query.repository';
import { Paginated, UsersPaginationType } from '../types/pagination.types';
import { getUsersPagination } from '../helpers/pagination.helpers';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private usersService: UsersService,
  ) {}
  @Get()
  async getAllUsers(@Query() params: any) {
    const pagination: UsersPaginationType = getUsersPagination(params);
    const users: Paginated<UsersViewType> =
      await this.usersQueryRepository.returnViewUsers(pagination);

    return users;
  }

  @Post()
  async createUser(@Body() dto: UsersCreate) {
    const idOfCreatedUser: string | null =
      await this.usersService.createUser(dto);

    if (!idOfCreatedUser)
      throw new HttpException('500 error', HttpStatus.INTERNAL_SERVER_ERROR);

    const user: UsersViewType | null =
      await this.usersQueryRepository.returnViewUserById(idOfCreatedUser);

    return user;
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteUser(@Param('id') userId: string) {
    const deleteResult: boolean = await this.usersService.deleteUser(userId);

    if (!deleteResult)
      throw new HttpException('not found', HttpStatus.NOT_FOUND);
  }
}
