import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { BlogsCreateUpdateWith_id, BlogsMainType } from '../5-dtos/blog.types';
import { Model } from 'mongoose';
import { DeviceMainType } from '../5-dtos/devices.types';

@Schema()
export class DevicesMainClass {
  @Prop({ required: true })
  _id: ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  websiteUrl: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  isMembership: boolean;

  static async createSaveDevice(
    blog: BlogsMainType,
    model: Model<DevicesMainClass>,
  ): Promise<string | null> {
    const newBlog = new model();

    newBlog._id = blog._id;
    newBlog.name = blog.name;
    newBlog.description = blog.description;
    newBlog.websiteUrl = blog.websiteUrl;
    newBlog.createdAt = blog.createdAt;
    newBlog.isMembership = blog.isMembership;

    // const result = await newBlog.save();
    // return result.
    try {
      await newBlog.save();
      return newBlog._id.toString();
    } catch (err) {
      return null;
    }
  }

  static async updateSaveDevice(
    blogDto: BlogsCreateUpdateWith_id,
    model: Model<DevicesMainClass>,
  ): Promise<boolean> {
    const dbBlog = await model.findById(new ObjectId(blogDto._id));

    if (!dbBlog) return false;

    dbBlog.websiteUrl = blogDto.websiteUrl;
    dbBlog.name = blogDto.name;
    dbBlog.description = blogDto.description;

    try {
      await dbBlog.save();
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
  ) => Promise<string | null>;

  updateSaveDevice: (
    device: BlogsCreateUpdateWith_id,
    model: Model<DevicesMainClass>,
  ) => Promise<boolean>;
}

export const DeviceSchema = SchemaFactory.createForClass(DevicesMainClass);
export type DeviceModelType = Model<DevicesMainClass> & DevicesModelStaticsType;

DeviceSchema.statics.createSaveDevice = DevicesMainClass.createSaveDevice;
DeviceSchema.statics.updateSaveDevice = DevicesMainClass.updateSaveDevice;
