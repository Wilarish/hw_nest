import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeviceModelType, DevicesMainClass } from '../3-schemas/devices.schema';
import { DeviceMainType, DeviceUpdateType } from '../5-dtos/devices.types';
import { ObjectId } from 'mongodb';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectModel(DevicesMainClass.name) private deviceModel: DeviceModelType,
  ) {}

  async createSaveNewDevice(device: DeviceMainType): Promise<boolean> {
    return this.deviceModel.createSaveDevice(device, this.deviceModel);
  }
  async findDeviceById(deviceId: string) {
    return this.deviceModel.findOne({ deviceId: deviceId });
  }

  async findDeviceByUserAndDeviceId(userId: string, deviceId: string) {
    return this.deviceModel.findOne({
      deviceId: deviceId,
      userId: new ObjectId(userId),
    });
  }

  async changeDevice(deviceUpdate: DeviceUpdateType) {
    return this.deviceModel.updateSaveDevice(deviceUpdate, this.deviceModel);
  }

  async deleteDevice(deviceId: string) {
    const result = await this.deviceModel.findOneAndDelete({
      deviceId: deviceId,
    });
    if (!result) return false;

    return result.deviceId === deviceId;
  }

  async deleteAllOtherDevices(userId: string, deviceId: string) {
    const result = await this.deviceModel.deleteMany({
      userId: new ObjectId(userId),
      deviceId: { $ne: deviceId },
    });
    return true;
  }
}
