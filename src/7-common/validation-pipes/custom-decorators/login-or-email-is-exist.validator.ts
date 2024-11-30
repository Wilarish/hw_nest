import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../2-repositories/users.repository';
import { UsersMainType } from '../../../5-dtos/users.types';

@ValidatorConstraint({ name: 'LoginOrEmailIsAlreadyExist', async: true })
@Injectable()
export class LoginOrEmailIsAlreadyExistValidator
  implements ValidatorConstraintInterface
{
  constructor(private usersRepository: UsersRepository) {}
  async validate(loginOrEmail: string): Promise<boolean> {
    const user: UsersMainType | null =
      await this.usersRepository.findUserByLoginOrEmail(loginOrEmail);

    if (!user) return true;
    return false;
  }
  defaultMessage(): string {
    return 'this login or email is already exist';
  }
}
export function LoginOrEmailIsAlreadyExist(
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: LoginOrEmailIsAlreadyExistValidator,
    });
  };
}
