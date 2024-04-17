import { IsEmail, IsMongoId, IsString, Length } from 'class-validator';
import { Trim } from './custom-decorators/trim';
import { LoginOrEmailIsAlreadyExist } from './custom-decorators/login-or-email-is-exist.validator';

export class UsersCreateValid {
  @LoginOrEmailIsAlreadyExist()
  @Length(3, 10)
  @Trim()
  @IsString()
  login: string;

  @Length(6, 20)
  @Trim()
  @IsString()
  password: string;

  @LoginOrEmailIsAlreadyExist()
  @Length(1, 50)
  @Trim()
  @IsEmail()
  email: string;
}
