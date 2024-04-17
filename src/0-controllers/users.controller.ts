import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersViewType } from '../5-dtos/users.types';
import { UsersQueryRepository } from '../2-repositories/query/users.query.repository';
import { Paginated, UsersPaginationType } from '../5-dtos/pagination.types';
import { getUsersPagination } from '../6-helpers/pagination.helpers';
import { UsersService } from '../1-services/users.service';
import { UsersCreateValid } from '../7-config/validation-pipes/users.pipes';
import { BasicAuthGuard } from '../7-config/guards/basic.auth.guard';
import { CustomObjectIdValidationPipe } from '../7-config/validation-pipes/custom-objectId-pipe';
import { NotFoundError } from 'rxjs';
import { callModuleDestroyHook } from '@nestjs/core/hooks';

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
  @Get(':id')
  async getUserById(@Param('id', CustomObjectIdValidationPipe) userId: string) {
    const user: UsersViewType | null =
      await this.usersQueryRepository.returnViewUserById(userId);

    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createUser(@Body() dto: UsersCreateValid) {
    const idOfCreatedUser: string | null =
      await this.usersService.createUser(dto);

    if (!idOfCreatedUser) throw new BadRequestException();

    const user: UsersViewType | null =
      await this.usersQueryRepository.returnViewUserById(idOfCreatedUser);

    return user;
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deleteUser(@Param('id', CustomObjectIdValidationPipe) userId: string) {
    const deleteResult: boolean = await this.usersService.deleteUser(userId);

    if (!deleteResult) {
      throw new NotFoundException();
    }
    return;
  }
}
