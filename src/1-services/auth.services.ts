import { v4 as uuidv4 } from 'uuid';
import { UsersMainType } from '../5-dtos/users.types';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../2-repositories/users.repository';
import { EmailServices } from './email-service';
import { UsersCreateValid } from '../7-config/validation-pipes/users.pipes';
import { BcryptAdapter } from '../4-adapters/bcrypt.adapter';
import { ObjectId } from 'mongodb';
import { add } from 'date-fns';
import { JwtAdapter } from '../4-adapters/jwt.adapter';
import { DeviceMainType } from '../5-dtos/devices.types';
import { DevicesServices } from './devices.services';
import {
  ExceptionsNames,
  ResponseToControllersHelper,
} from '../6-helpers/response.to.controllers.helper';

@Injectable()
export class AuthServices {
  constructor(
    protected usersRepository: UsersRepository,
    protected emailServices: EmailServices,
    private bcryptAdapter: BcryptAdapter,
    private jwtAdapter: JwtAdapter,
    private deviceServices: DevicesServices,
  ) {}

  async login(
    loginOrEmail: string,
    password: string,
    ip: string,
    title?: string,
  ): Promise<ResponseToControllersHelper> {
    const user: UsersMainType | null =
      await this.usersRepository.findUserByLoginOrEmail(loginOrEmail);

    if (!user) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.Unauthorized_401,
      );
    }

    if (!user.emailConfirmation.isConfirmed) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.Unauthorized_401, ///// 401 or 400 because not a password
      );
    }
    if (!title) {
      title = 'none';
    }

    const hash: string = await this.bcryptAdapter.passwordHashWithoutSalt(
      password,
      user.passwordSalt,
    );
    if (hash !== user.passwordHash) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.Unauthorized_401,
      );
    }

    const tokens = await this.createTokensAndDevice(
      user._id.toString(),
      ip,
      title,
    );

    const responseData = {
      accessToken: tokens?.accessToken,
    };

    return new ResponseToControllersHelper(
      false,
      undefined,
      responseData,
      tokens?.refreshToken,
    );
  }

  async createTokensAndDevice(userId: string, ip: string, title: string) {
    const accessToken: string = await this.jwtAdapter.createAccessJwt(userId);
    const refreshToken: string = await this.jwtAdapter.createRefreshJwt(
      userId,
      uuidv4(),
    );
    const decode: any = await this.jwtAdapter.getPayloadOfJwt(refreshToken);

    const device: DeviceMainType = {
      ip: ip,
      title: title,
      lastActiveDate: new Date(decode!.iat! * 1000).toISOString(),
      deviceId: decode.deviceId?.toString(),
      userId: new ObjectId(userId),
    };

    const addDevice: boolean = await this.deviceServices.addNewDevice(device);
    if (!addDevice) return null;

    return {
      accessToken,
      refreshToken,
    };
  }
  async changeTokensAndDevices(token: string) {
    const result = await this.jwtAdapter.refreshToken(token);
    if (!result) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.BadRequest_400,
      );
    }

    await this.deviceServices.changeDevice(
      result.refreshToken.payload.deviceId,
      result.refreshToken.payload.iat,
    );

    const responseData = {
      accessToken: result.accessToken,
    };

    return new ResponseToControllersHelper(
      false,
      undefined,
      responseData,
      result.refreshToken.token,
    );
  }
  async createUser(
    data: UsersCreateValid,
  ): Promise<ResponseToControllersHelper> {
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
        expirationDate: add(new Date(), {
          hours: 2,
          minutes: 0,
          seconds: 5,
        }).toISOString(),
        isConfirmed: false,
      },
      passwordChanging: {
        setPasswordCode: 'none',
        expirationDate: 'none',
      },
    };

    await this.usersRepository.createSaveUser(new_user);

    try {
      await this.emailServices.SendEmailForRegistration(
        new_user.email,
        new_user.emailConfirmation.confirmationCode,
      );
    } catch (error) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.BadRequest_400,
      );
    }

    return new ResponseToControllersHelper(false);
  }

  async confirmEmail(code: string): Promise<ResponseToControllersHelper> {
    const user: UsersMainType | null =
      await this.usersRepository.findUserByConfirmationCode(code);

    if (!user) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.BadRequest_400,
      );
    }

    const result: boolean = await this.usersRepository.updateConfirmation(
      user._id.toString(),
    );
    if (!result) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.BadRequest_400,
      );
    }

    return new ResponseToControllersHelper(false);
  }

  async resendCode(email: string): Promise<ResponseToControllersHelper> {
    const user: UsersMainType | null =
      await this.usersRepository.findUserByLoginOrEmail(email);

    if (!user) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.BadRequest_400,
      );
    }

    const newConfirmationCode: string = uuidv4();

    await this.usersRepository.updateConfirmationCode(
      user._id.toString(),
      newConfirmationCode,
    );

    try {
      await this.emailServices.SendEmailForRegistration(
        user.email,
        newConfirmationCode,
      );
    } catch (error) {
      console.error(error);
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.BadRequest_400,
      );
    }

    return new ResponseToControllersHelper(false);
  }
  async refreshPassword(email: string): Promise<ResponseToControllersHelper> {
    const user: UsersMainType | null =
      await this.usersRepository.findUserByLoginOrEmail(email);

    if (!user) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.BadRequest_400,
      );
    }
    const changeCode = uuidv4();
    const expirationDate = add(new Date(), { minutes: 30 }).toISOString();

    await this.emailServices.SendEmailForRefreshPassword(email, changeCode);

    const result: boolean = await this.usersRepository.createChangePasswordCode(
      user._id.toString(),
      changeCode,
      expirationDate,
    );

    if (!result) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.BadRequest_400,
      );
    }
    return new ResponseToControllersHelper(false);
  }

  async setNewPassword(
    newPassword: string,
    changeCode: string,
  ): Promise<ResponseToControllersHelper> {
    const user =
      await this.usersRepository.findUserByChangePasswordCode(changeCode);

    if (!user) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.BadRequest_400,
      );
    }
    if (new Date(user.passwordChanging.expirationDate) < new Date()) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.BadRequest_400,
      );
    }

    const passInfo = await this.bcryptAdapter.passwordHash(newPassword);

    const result: boolean =
      await this.usersRepository.changeHashSaltPasswordChanging(
        user._id.toString(),
        passInfo.passwordHash,
        passInfo.passwordSalt,
      );

    if (!result) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.BadRequest_400,
      );
    }

    return new ResponseToControllersHelper(false);
  }

  async logout(token: string): Promise<ResponseToControllersHelper> {
    const payload = await this.jwtAdapter.getPayloadOfJwt(token);
    if (!payload) {
      return new ResponseToControllersHelper(
        true,
        ExceptionsNames.BadRequest_400,
      );
    }
    return this.deviceServices.deleteDevice(payload.deviceId, payload.userId);
  }
}
