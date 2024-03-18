import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Injectable()
export class CustomObjectIdValidationPipe
  implements PipeTransform<string, string>
{
  transform(value: string): string {
    try {
      new ObjectId(value);
    } catch (err) {
      throw new BadRequestException('Invalid Uri Id');
    }

    return value;
  }
}
