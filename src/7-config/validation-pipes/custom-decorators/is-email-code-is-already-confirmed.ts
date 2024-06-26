import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../2-repositories/users.repository';
import { UsersMainType } from '../../../5-dtos/users.types';

@ValidatorConstraint({ name: 'IsCodeIsAlreadyConfirmed', async: true })
@Injectable()
export class IsCodeIsAlreadyConfirmedValidator
  implements ValidatorConstraintInterface
{
  constructor(private usersRepository: UsersRepository) {}
  async validate(code: string): Promise<boolean> {
    const user: UsersMainType | null =
      await this.usersRepository.findUserByConfirmationCode(code);

    if (!user) return false;

    if (user.emailConfirmation.isConfirmed) {
      return false;
    }

    return true;
  }
  defaultMessage(): string {
    return 'user is already confirmed email or code is incorrect/expired';
  }
}
export function IsCodeIsAlreadyConfirmed(
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsCodeIsAlreadyConfirmedValidator,
    });
  };
}
