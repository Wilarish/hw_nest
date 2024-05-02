import { likeStatuses } from '../../5-dtos/likes.types';
import { IsEnum, IsString } from 'class-validator';

export class LikeStatusValid {
  @IsEnum(likeStatuses)
  @IsString()
  likeStatus: likeStatuses;
}
