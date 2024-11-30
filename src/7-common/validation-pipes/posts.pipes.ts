import { ObjectId } from 'mongodb';
import { IsMongoId, IsString, Length } from 'class-validator';
import { Trim } from './custom-decorators/trim';
import { IsBlogExist } from './custom-decorators/is-blog-exist';

export class PostsCreateUpdateValidate {
  @Length(1, 30)
  @Trim()
  @IsString()
  title: string;

  @Length(1, 100)
  @Trim()
  @IsString()
  shortDescription: string;

  @Length(1, 1000)
  @Trim()
  @IsString()
  content: string;

  @IsBlogExist()
  @IsMongoId()
  blogId: ObjectId;
}

export class PostsCreateInBlogsControllerValidate {
  @Length(1, 30)
  @Trim()
  @IsString()
  title: string;

  @Length(1, 100)
  @Trim()
  @IsString()
  shortDescription: string;

  @Length(1, 1000)
  @Trim()
  @IsString()
  content: string;
}
