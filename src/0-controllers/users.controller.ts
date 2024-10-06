import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../1-services/users.service';
import { ResponseToControllersHelper } from '../6-helpers/response.to.controllers.helper';
import { UsersQueryRepository } from '../2-repositories/query/users.query.repository';
import { CustomObjectIdValidationPipe } from '../7-common/validation-pipes/custom-objectId-pipe';
import { BasicAuthGuard } from '../7-common/guards/basic.auth.guard';
import { UsersCreateValid } from '../7-common/validation-pipes/users.pipes';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}
  @Get()
  async getAllUsers(@Query() params: any) {
    const result: ResponseToControllersHelper =
      await this.usersQueryRepository.returnViewUsers(params);

    return ResponseToControllersHelper.checkReturnException(result);
  }
  @Get(':id')
  async getUserById(@Param('id', CustomObjectIdValidationPipe) userId: string) {
    const result: ResponseToControllersHelper =
      await this.usersQueryRepository.returnViewUserById(userId);

    return ResponseToControllersHelper.checkReturnException(result);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createUser(@Body() dto: UsersCreateValid) {
    const result: ResponseToControllersHelper =
      await this.usersService.createUser(dto);

    return ResponseToControllersHelper.checkReturnException(result);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deleteUser(@Param('id', CustomObjectIdValidationPipe) userId: string) {
    const result: ResponseToControllersHelper =
      await this.usersService.deleteUser(userId);

    return ResponseToControllersHelper.checkReturnException(result);
  }
}
