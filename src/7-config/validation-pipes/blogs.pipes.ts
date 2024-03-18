import { IsString, IsUrl, Length } from 'class-validator';
import { Trim } from './custom-decorators/trim';

export class BlogsCreateUpdateValid {
  @Length(3, 15)
  @Trim()
  @IsString()
  name: string;

  @Length(3, 500)
  @Trim()
  @IsString()
  description: string;

  @Length(3, 100)
  @Trim()
  @IsUrl()
  @IsString()
  websiteUrl: string;
}
