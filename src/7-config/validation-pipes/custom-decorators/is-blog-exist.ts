import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../../../2-repositories/blogs.repository';
import { BlogsMainType } from '../../../5-dtos/blog.types';

@ValidatorConstraint({ name: 'IsBlogExist', async: true })
@Injectable()
export class IsBlogExistValidator implements ValidatorConstraintInterface {
  constructor(private blogsRepository: BlogsRepository) {}
  async validate(blogId: string): Promise<boolean> {
    const blog: BlogsMainType | null =
      await this.blogsRepository.findBlogById(blogId);

    if (!blog) return false;

    return true;
  }
  defaultMessage(): string {
    return 'blog with this _id do not exist';
  }
}
export function IsBlogExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsBlogExistValidator,
    });
  };
}
