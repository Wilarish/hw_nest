import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DevicesServices } from '../1-services/devices.services';
import { JwtRefreshTokenAuthGuard } from '../7-config/guards/refresh.token.auth.guard';
import { Request } from 'express';
import { DevicesQueryRepository } from '../2-repositories/query/devices.query.repository';
import { DeviceViewType } from '../5-dtos/devices.types';
import { CustomObjectIdValidationPipe } from '../7-config/validation-pipes/custom-objectId-pipe';

@Controller('security')
export class SecurityDevicesController {
  constructor(
    private readonly deviceService: DevicesServices,
    private readonly deviceQueryRepository: DevicesQueryRepository,
  ) {}

  @Get('devices')
  @UseGuards(JwtRefreshTokenAuthGuard)
  async getDevicesForCurrentUser(@Req() req: Request) {
    const devices: DeviceViewType[] =
      await this.deviceQueryRepository.getDevicesForCurrentUser(req.userId);
    if (devices.length === 0) {
      throw new BadRequestException();
    }
    return devices;
  }

  @Delete('devices')
  @HttpCode(204)
  @UseGuards(JwtRefreshTokenAuthGuard)
  async deleteAllOtherDevices(@Req() req: Request) {
    const result: boolean = await this.deviceService.deleteAllOtherDevices(
      req.userId,
      req.deviceId,
    );

    if (!result) {
      throw new BadRequestException();
    }
    return;
  }
  @Delete('devices/:id')
  @HttpCode(204)
  @UseGuards(JwtRefreshTokenAuthGuard)
  async deleteDevice(@Param('id') deviceId: string) {
    const result: boolean = await this.deviceService.deleteDevice(deviceId);

    if (!result) {
      throw new BadRequestException();
    }
    return;
  }
}
