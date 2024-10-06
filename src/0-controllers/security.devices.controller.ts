import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DevicesServices } from '../1-services/devices.services';
import { Request } from 'express';
import { DevicesQueryRepository } from '../2-repositories/query/devices.query.repository';
import { DevicesRepository } from '../2-repositories/devices.repository';
import { ResponseToControllersHelper } from '../6-helpers/response.to.controllers.helper';
import { JwtRefreshTokenAuthGuard } from '../7-common/guards/refresh.token.auth.guard';

@Controller('security')
export class SecurityDevicesController {
  constructor(
    private readonly deviceService: DevicesServices,
    private readonly deviceQueryRepository: DevicesQueryRepository,
    private readonly deviceRepository: DevicesRepository,
  ) {}

  @Get('devices')
  @UseGuards(JwtRefreshTokenAuthGuard)
  async getDevicesForCurrentUser(@Req() req: Request) {
    const result: ResponseToControllersHelper =
      await this.deviceQueryRepository.getDevicesForCurrentUser(req.userId);

    return ResponseToControllersHelper.checkReturnException(result);
  }

  @Delete('devices')
  @HttpCode(204)
  @UseGuards(JwtRefreshTokenAuthGuard)
  async deleteAllOtherDevices(@Req() req: Request) {
    const result = await this.deviceService.deleteAllOtherDevices(
      req.userId,
      req.deviceId,
    );
    return ResponseToControllersHelper.checkReturnException(result);
  }
  @Delete('devices/:id')
  @HttpCode(204)
  @UseGuards(JwtRefreshTokenAuthGuard)
  async deleteDevice(@Param('id') deviceId: string, @Req() req: Request) {
    const result = await this.deviceService.deleteDevice(
      deviceId,
      req.userId.toString(),
    );

    return ResponseToControllersHelper.checkReturnException(result);
  }
}
