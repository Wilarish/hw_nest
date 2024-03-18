import { IsEmail, IsMongoId, IsString, Length } from 'class-validator';
import { Trim } from './custom-decorators/trim';
import { LoginOrEmailIsAlreadyExist } from './custom-decorators/login-or-email-is-exist.validator';

export class UsersCreateValid {
  @IsString()
  @Trim()
  @Length(3, 10)
  @LoginOrEmailIsAlreadyExist()
  login: string;

  @IsString()
  @Trim()
  @Length(6, 20)
  password: string;

  @IsEmail()
  @Trim()
  @Length(1, 50)
  @LoginOrEmailIsAlreadyExist()
  email: string;
}
