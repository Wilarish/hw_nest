import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { RateLimitType } from '../../5-dtos/rate.limit.types';
import { InjectModel } from '@nestjs/mongoose';
import { RateLimitMainClass } from '../../3-schemas/rate.limit.schema';
import { Model } from 'mongoose';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    @InjectModel(RateLimitMainClass.name)
    private readonly rateLimitSchema: Model<RateLimitMainClass>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (request.ip) {
      const rate: RateLimitType = {
        IP: request.ip,
        URL: request.url,
        date: new Date(),
      };
      await this.rateLimitSchema.insertMany(rate);
    }

    const currentDate = new Date();
    const tenSecondsAgo = new Date(currentDate.getTime() - 10000);

    const requests = await this.rateLimitSchema
      .find({
        date: { $lt: currentDate, $gt: tenSecondsAgo },
        IP: request.ip,
        URL: request.url,
      })
      .lean();
    if (requests.length > 5) {
      throw new HttpException('too many requests', 429);
    }
    return true;
  }
}
