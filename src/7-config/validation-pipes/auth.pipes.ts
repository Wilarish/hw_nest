import { IsEmail, IsJWT, IsString, Length } from 'class-validator';
import { Trim } from './custom-decorators/trim';
import { IsCodeIsAlreadyConfirmed } from './custom-decorators/is-email-code-is-already-confirmed';
import { IsThisEmailExists } from './custom-decorators/is-email-exists';
import { IsThisEmailConfirmed } from './custom-decorators/is-email-already-confirmed';

export class AuthUUIDCodeValid {
  @IsCodeIsAlreadyConfirmed()
  @Length(20, 250)
  @Trim()
  @IsString()
  code: string;
}
export class AuthEmailValid {
  @IsThisEmailExists()
  @IsThisEmailConfirmed()
  @Length(5, 100)
  @Trim()
  @IsEmail()
  @IsString()
  email: string;
}
export class AuthNewPassValid {
  @Length(5, 50)
  @Trim()
  @IsString()
  newPassword: string;

  @Length(5, 500)
  @Trim()
  @IsJWT()
  @IsString()
  recoveryCode: string;
}
export class AuthLoginValid {
  @Length(1, 50)
  @Trim()
  @IsString()
  loginOrEmail: string;

  @Length(6, 20)
  @Trim()
  @IsString()
  password: string;
}
