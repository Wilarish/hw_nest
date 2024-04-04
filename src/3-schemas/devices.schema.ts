import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { DeviceMainType, DeviceUpdateType } from '../5-dtos/devices.types';

@Schema()
export class DevicesMainClass {
  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  lastActiveDate: string;

  @Prop({ required: true })
  userId: ObjectId;

  static async createSaveDevice(
    device: DeviceMainType,
    model: Model<DevicesMainClass>,
  ): Promise<boolean> {
    const newDevice = new model();

    newDevice.ip = device.ip;
    newDevice.deviceId = device.deviceId;
    newDevice.title = device.title;
    newDevice.lastActiveDate = device.lastActiveDate;
    newDevice.userId = device.userId;

    try {
      await newDevice.save();
      console.log(newDevice.deviceId);
      return true;
    } catch (err) {
      return false;
    }
  }

  static async updateSaveDevice(
    deviceDto: DeviceUpdateType,
    model: Model<DevicesMainClass>,
  ): Promise<boolean> {
    const dbDevice = await model.findOne({ deviceId: deviceDto.deviceId });

    if (!dbDevice) return false;

    dbDevice.lastActiveDate = deviceDto.lastActiveDate;

    try {
      await dbDevice.save();
      return true;
    } catch (err) {
      return false;
    }
  }
}

export interface DevicesModelStaticsType {
  //почему тут не ставится async ?
  createSaveDevice: (
    device: DeviceMainType,
    model: Model<DevicesMainClass>,
  ) => Promise<boolean>;

  updateSaveDevice: (
    deviceDto: DeviceUpdateType,
    model: Model<DevicesMainClass>,
  ) => Promise<boolean>;
}

export const DeviceSchema = SchemaFactory.createForClass(DevicesMainClass);
export type DeviceModelType = Model<DevicesMainClass> & DevicesModelStaticsType;

DeviceSchema.statics.createSaveDevice = DevicesMainClass.createSaveDevice;
DeviceSchema.statics.updateSaveDevice = DevicesMainClass.updateSaveDevice;
