import { v4 as uuidv4 } from 'uuid';
import { UsersMainType } from '../5-dtos/users.types';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../2-repositories/users.repository';
import { EmailServices } from './email-service';
import { UsersCreateValid } from '../7-config/validation-pipes/users.pipes';
import { BcryptAdapter } from '../4-adapters/bcrypt.adapter';
import { ObjectId } from 'mongodb';
import { add } from 'date-fns';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthServices {
  constructor(
    protected usersRepository: UsersRepository,
    protected emailServices: EmailServices,
    private bcryptAdapter: BcryptAdapter,
    private jwtService: JwtService,
    //protected deviceServices: DeviceServices,
  ) {}

  async createUser(data: UsersCreateValid): Promise<boolean> {
    const passwordInfo: { passwordSalt; passwordHash } =
      await this.bcryptAdapter.passwordHash(data.password);

    const new_user: UsersMainType = {
      _id: new ObjectId(),
      login: data.login,
      email: data.email,
      passwordSalt: passwordInfo.passwordSalt,
      passwordHash: passwordInfo.passwordHash,
      createdAt: new Date().toISOString(),
      emailConfirmation: {
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), { hours: 2, minutes: 3 }).toISOString(),
        isConfirmed: false,
      },
    };

    await this.usersRepository.createSaveUser(new_user);

    try {
      await this.emailServices.SendEmailForRegistration(
        new_user.email,
        new_user.emailConfirmation.confirmationCode,
      );
      console.log(new_user.emailConfirmation.confirmationCode);
    } catch (error) {
      return false;
    }

    return true;
  }

  async confirmEmail(code: string): Promise<boolean> {
    const user: UsersMainType | null =
      await this.usersRepository.findUserByConfirmationCode(code);

    if (!user) return false;

    return await this.usersRepository.updateConfirmation(user._id.toString());
  }

  async resendCode(email: string): Promise<boolean> {
    const user: UsersMainType | null =
      await this.usersRepository.findUserByLoginOrEmail(email);

    if (!user) return false;

    const newConfirmationCode: string = uuidv4();

    await this.usersRepository.updateConfirmationCode(
      user._id.toString(),
      newConfirmationCode,
    );

    try {
      await this.emailServices.SendEmailForRegistration(
        user.email,
        newConfirmationCode,
      ); //user.email, newConfirmationCode
    } catch (error) {
      console.error(error);
      return false;
    }

    return true;
  }
  async refreshPassword(email: string): Promise<boolean> {
    const user: UsersMainType | null =
      await this.usersRepository.findUserByLoginOrEmail(email);

    if (!user) {
      return false;
    }
    const recoveryCode: string = await this.jwtService.signAsync({
      _id: user._id.toString(),
    });
    console.log(recoveryCode);

    await this.emailServices.SendEmailForRefreshPassword(email, recoveryCode);

    return true;
  }

  async setNewPassword(
    newPassword: string,
    recoveryCode: string,
  ): Promise<boolean> {
    const payload = await this.jwtService.verifyAsync(recoveryCode, {
      secret: 'qwerty',
    });
    if (!payload) return false;

    const passInfo = await this.bcryptAdapter.passwordHash(newPassword);

    return this.usersRepository.changeHashAndSalt(
      payload._id,
      passInfo.passwordHash,
      passInfo.passwordSalt,
    );
  }
}
