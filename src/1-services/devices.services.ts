import { Injectable } from '@nestjs/common';
import { DeviceMainType, DeviceUpdateType } from '../5-dtos/devices.types';
import { DevicesRepository } from '../2-repositories/devices.repository';

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

  async deleteDevice(deviceId: string) {
    return this.deviceRepository.deleteDevice(deviceId);
  }

  async deleteAllOtherDevices(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    return this.deviceRepository.deleteAllOtherDevices(userId, deviceId);
  }
}
