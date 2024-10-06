import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class RateLimitMainClass {
  @Prop({ required: true })
  IP: string;

  @Prop({ required: true })
  URL: string;

  @Prop({ required: true })
  date: string;
}
export const RateLimitSchema = SchemaFactory.createForClass(RateLimitMainClass);
