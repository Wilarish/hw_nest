import { IsString, Length } from 'class-validator';
import { Trim } from './custom-decorators/trim';
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectId } from 'mongodb';

export class CommentsCreateUpdateValidate {
  @Length(20, 300)
  @Trim()
  @IsString()
  content: string;
}
@Injectable()
export class CustomCommentIdValidationPipe
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
