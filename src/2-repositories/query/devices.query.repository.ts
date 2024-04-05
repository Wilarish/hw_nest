import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { DevicesRepository } from '../devices.repository';
import {
  DeviceModelType,
  DevicesMainClass,
} from '../../3-schemas/devices.schema';
import { DeviceMainType, DeviceViewType } from '../../5-dtos/devices.types';
import { ObjectId } from 'mongodb';

@Injectable()
export class DevicesQueryRepository {
  constructor(
    @InjectModel(DevicesMainClass.name)
    private readonly deviceModel: DeviceModelType,
  ) {}
  async getDevicesForCurrentUser(userId: string): Promise<DeviceViewType[]> {
    return this.deviceModel
      .find({ userId: new ObjectId(userId) }, { __v: 0, _id: 0, userId: 0 })
      .lean();
  }
}
