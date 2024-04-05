import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../2-repositories/users.repository';
import { UsersMainType } from '../../../5-dtos/users.types';

@ValidatorConstraint({ name: 'IsThisEmailExists', async: true })
@Injectable()
export class IsThisEmailExistsValidator
  implements ValidatorConstraintInterface
{
  constructor(private usersRepository: UsersRepository) {}
  async validate(email: string): Promise<boolean> {
    const user: UsersMainType | null =
      await this.usersRepository.findUserByLoginOrEmail(email);

    if (!user) return false;

    return true;
  }
  defaultMessage(): string {
    return 'this email is not exist';
  }
}
export function IsThisEmailExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsThisEmailExistsValidator,
    });
  };
}
