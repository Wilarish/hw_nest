import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../2-repositories/users.repository';
import { UsersMainType } from '../../../5-dtos/users.types';

@ValidatorConstraint({ name: 'IsConfirmationCodeExpired', async: true })
@Injectable()
export class IsConfirmationCodeExpiredValidator
  implements ValidatorConstraintInterface
{
  constructor(private usersRepository: UsersRepository) {}
  async validate(code: string): Promise<boolean> {
    const user: UsersMainType | null =
      await this.usersRepository.findUserByConfirmationCode(code);

    if (!user) return false;

    if (new Date(user.emailConfirmation.expirationDate) < new Date()) {
      return false;
    }

    return true;
  }
  defaultMessage(): string {
    return 'confirmation code is expired';
  }
}
export function IsConfirmationCodeExpired(
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsConfirmationCodeExpiredValidator,
    });
  };
}
