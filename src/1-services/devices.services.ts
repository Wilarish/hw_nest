import { Injectable } from '@nestjs/common';
import { DeviceMainType, DeviceUpdateType } from '../5-dtos/devices.types';
import { DevicesRepository } from '../2-repositories/devices.repository';
import {
  ExceptionsNames,
  ResponseToControllersHelper,
} from '../6-helpers/response.to.controllers.helper';

@Injectable()
export class DevicesServices {
  constructor(private deviceRepository: DevicesRepository) {}
  async addNewDevice(device: DeviceMainType): Promise<boolean> {
    return this.deviceRepository.createSaveNewDevice(device);
  }

  async changeDevice(deviceId: string, iat: number) {
    const lastActiveDate = new Date(iat * 1000).toISOString();
    const deviceUpdate: DeviceUpdateType = {
      lastActiveDate,
      deviceId,
    };

    return this.deviceRepository.changeDevice(deviceUpdate);
  }

  async deleteDevice(deviceId: string, userId: string) {
    const device = await this.deviceRepository.findDeviceById(deviceId);
    if (!device) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.NotFound_404,
      );
    }
    if (device.userId.toString() != userId) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.Forbidden_403,
      );
    }
    await this.deviceRepository.deleteDevice(deviceId);
    return new ResponseToControllersHelper(false);
  }

  async deleteAllOtherDevices(
    userId: string,
    deviceId: string,
  ): Promise<ResponseToControllersHelper> {
    await this.deviceRepository.deleteAllOtherDevices(userId, deviceId);
    return new ResponseToControllersHelper(false);
  }
}
