import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersCreateValid } from '../7-config/validation-pipes/users.pipes';
import { AuthServices } from '../1-services/auth.services';

import {
  AuthUUIDCodeValid,
  AuthEmailConfirmationValid,
  AuthNewPassValid,
  AuthLoginValid,
  AuthPasswordRecoveryValid,
} from '../7-config/validation-pipes/auth.pipes';
import { Request, Response } from 'express';
import { DevicesRepository } from '../2-repositories/devices.repository';
import { JwtRefreshTokenAuthGuard } from '../7-config/guards/refresh.token.auth.guard';
import { UsersService } from '../1-services/users.service';
import { BasicAuthGuard } from '../7-config/guards/basic.auth.guard';
import { RateLimitGuard } from '../7-config/guards/rate.limit.guard';
import { ResponseToControllersHelper } from '../6-helpers/response.to.controllers.helper';

@Controller('auth')
export class AuthController {
  constructor(
    private authServices: AuthServices,
    private usersService: UsersService,
    private deviceRepository: DevicesRepository,
  ) {}
  @Get('test')
  @UseGuards(RateLimitGuard, BasicAuthGuard)
  async Test(@Body() dto: any) {
    return this.deviceRepository.findDeviceById(dto.deviceId);
  }
  @Get('me')
  @UseGuards(JwtRefreshTokenAuthGuard)
  async getInfoAboutMe(@Req() req: Request) {
    const result: ResponseToControllersHelper =
      await this.usersService.getInformationAboutMe(req.userId);

    return ResponseToControllersHelper.checkReturnException(result);
  }

  @Post('logout')
  @UseGuards(JwtRefreshTokenAuthGuard)
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result: ResponseToControllersHelper = await this.authServices.logout(
      req.cookies.refreshToken,
    );

    res.clearCookie('refreshToken');
    return ResponseToControllersHelper.checkReturnException(result);
  }
  @Post('refresh-token')
  @UseGuards(JwtRefreshTokenAuthGuard)
  @HttpCode(200)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result: ResponseToControllersHelper =
      await this.authServices.changeTokensAndDevices(req.cookies.refreshToken);

    if (!result.isError) {
      res.cookie('refreshToken', result.dataToController, {
        httpOnly: true,
        secure: true,
      });
    }

    return ResponseToControllersHelper.checkReturnException(result);
  }

  @Post('login')
  @UseGuards(RateLimitGuard)
  @HttpCode(200)
  async login(
    @Body() dto: AuthLoginValid,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userIp: string =
      req.headers['x-forwarded-for']?.toString() ||
      [req.socket.remoteAddress].toString();
    const title: string | undefined = req.headers['user-agent'];

    const result: ResponseToControllersHelper = await this.authServices.login(
      dto.loginOrEmail,
      dto.password,
      userIp,
      title?.toString(),
    );
    if (!result.isError) {
      res.cookie('refreshToken', result.dataToController, {
        httpOnly: true,
        secure: true,
      });
    }
    return ResponseToControllersHelper.checkReturnException(result);
  }

  @Post('registration')
  @UseGuards(RateLimitGuard)
  @HttpCode(204)
  async registration(@Body() dto: UsersCreateValid) {
    const result: ResponseToControllersHelper =
      await this.authServices.createUser(dto);

    return ResponseToControllersHelper.checkReturnException(result);
  }
  @Post('registration-confirmation')
  @UseGuards(RateLimitGuard)
  @HttpCode(204)
  async registrationConfirmation(@Body() dto: AuthUUIDCodeValid) {
    const result: ResponseToControllersHelper =
      await this.authServices.confirmEmail(dto!.code);

    return ResponseToControllersHelper.checkReturnException(result);
  }

  @Post('registration-email-resending')
  @UseGuards(RateLimitGuard)
  @HttpCode(204)
  async registrationEmailResending(@Body() dto: AuthEmailConfirmationValid) {
    const result: ResponseToControllersHelper =
      await this.authServices.resendCode(dto.email);

    return ResponseToControllersHelper.checkReturnException(result);
  }

  @Post('password-recovery')
  @UseGuards(RateLimitGuard)
  @HttpCode(204)
  async passwordRecovery(@Body() dto: AuthPasswordRecoveryValid) {
    const result: ResponseToControllersHelper =
      await this.authServices.refreshPassword(dto.email);

    return ResponseToControllersHelper.checkReturnException(result);
  }

  @Post('new-password')
  @UseGuards(RateLimitGuard)
  @HttpCode(204)
  async newPassword(@Body() dto: AuthNewPassValid) {
    const result: ResponseToControllersHelper =
      await this.authServices.setNewPassword(dto.newPassword, dto.recoveryCode);

    return ResponseToControllersHelper.checkReturnException(result);
  }
}
