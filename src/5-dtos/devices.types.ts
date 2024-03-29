import { ObjectId } from 'mongodb';

export type DeviceMainType = {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
  userId: ObjectId;
};
export type DeviceViewType = {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
};
