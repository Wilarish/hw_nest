import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DeviceMainType } from '../../5-dtos/devices.types';
import { DevicesRepository } from '../../2-repositories/devices.repository';
import { JwtAdapter } from '../../4-adapters/jwt.adapter';

@Injectable()
export class JwtRefreshTokenAuthGuard implements CanActivate {
  constructor(
    private deviceRepository: DevicesRepository,
    private jwtAdapter: JwtAdapter,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies.refreshToken;

    const payload = await this.jwtAdapter.findUserByToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException();
    }

    const device: DeviceMainType | null =
      await this.deviceRepository.findDeviceByUserAndDeviceId(
        payload.userId.toString(),
        payload.deviceId,
      );
    if (!device) {
      throw new UnauthorizedException();
    }

    if (device.lastActiveDate !== new Date(payload.iat * 1000).toISOString()) {
      throw new UnauthorizedException();
    }

    request['userId'] = payload.userId;
    request['deviceId'] = payload.deviceId;

    return true;
  }
}
