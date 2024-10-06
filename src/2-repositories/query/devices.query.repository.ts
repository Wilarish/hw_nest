import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  DeviceModelType,
  DevicesMainClass,
} from '../../3-schemas/devices.schema';
import { ObjectId } from 'mongodb';
import {
  ExceptionsNames,
  ResponseToControllersHelper,
} from '../../6-helpers/response.to.controllers.helper';

@Injectable()
export class DevicesQueryRepository {
  constructor(
    @InjectModel(DevicesMainClass.name)
    private readonly deviceModel: DeviceModelType,
  ) {}
  async getDevicesForCurrentUser(
    userId: string,
  ): Promise<ResponseToControllersHelper> {
    const devices = await this.deviceModel
      .find({ userId: new ObjectId(userId) }, { __v: 0, _id: 0, userId: 0 })
      .lean();

    if (devices.length === 0) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.BadRequest_400,
      );
    }
    return new ResponseToControllersHelper(false, undefined, devices);
  }
}
