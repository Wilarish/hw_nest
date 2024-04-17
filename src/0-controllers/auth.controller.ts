import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UsersCreateValid } from '../7-config/validation-pipes/users.pipes';
import { AuthServices } from '../1-services/auth.services';
import { UsersRepository } from '../2-repositories/users.repository';
import {
  AuthUUIDCodeValid,
  AuthEmailValid,
  AuthNewPassValid,
  AuthLoginValid,
} from '../7-config/validation-pipes/auth.pipes';
import { Request, Response } from 'express';
import { DevicesRepository } from '../2-repositories/devices.repository';
import { JwtRefreshTokenAuthGuard } from '../7-config/guards/refresh.token.auth.guard';
import { UsersService } from '../1-services/users.service';
import { UsersGetInfoAboutMeType, UsersViewType } from '../5-dtos/users.types';
import { BasicAuthGuard } from '../7-config/guards/basic.auth.guard';
import { RateLimitGuard } from '../7-config/guards/rate.limit.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authServices: AuthServices,
    private usersService: UsersService,
    private deviceRepository: DevicesRepository,
  ) {}
  @Get()
  @UseGuards(RateLimitGuard, BasicAuthGuard)
  async Test(@Body() dto: any) {
    return this.deviceRepository.findDeviceById(dto.deviceId);
  }
  @Get('me')
  @UseGuards(JwtRefreshTokenAuthGuard)
  async getInfoAboutMe(@Req() req: Request) {
    const user: UsersGetInfoAboutMeType | null =
      await this.usersService.getInformationAboutMe(req.userId);
    if (!user) {
      throw new BadRequestException();
    }
    return user;
  }

  @Post('logout')
  @UseGuards(JwtRefreshTokenAuthGuard)
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authServices.logout(req.cookies.refreshToken);
    if (!result) {
      throw new BadRequestException();
    }
    res.clearCookie('refreshToken');
    return;
  }
  @Post('refresh-token')
  @UseGuards(JwtRefreshTokenAuthGuard)
  @HttpCode(200)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authServices.changeTokensAndDevices(
      req.cookies.refreshToken,
    );
    if (!result) {
      throw new BadRequestException();
    }
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return {
      accessToken: result.accessToken,
    };
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

    const loginResult = await this.authServices.login(
      dto.loginOrEmail,
      dto.password,
      userIp,
      title?.toString(),
    );

    if (!loginResult) {
      throw new UnauthorizedException();
    }
    res.cookie('refreshToken', loginResult.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return {
      accessToken: loginResult.accessToken,
    };
  }

  @Post('registration')
  @UseGuards(RateLimitGuard)
  @HttpCode(204)
  async registration(@Body() dto: UsersCreateValid) {
    const regResult: boolean = await this.authServices.createUser(dto);
    if (!regResult) {
      throw new BadRequestException();
    }
    return true;
  }
  @Post('registration-confirmation')
  @UseGuards(RateLimitGuard)
  @HttpCode(204)
  async registrationConfirmation(@Body() dto: AuthUUIDCodeValid) {
    const confirmResult: boolean = await this.authServices.confirmEmail(
      dto!.code,
    );
    if (!confirmResult) {
      throw new BadRequestException();
    }
    return true;
  }

  @Post('registration-email-resending')
  @UseGuards(RateLimitGuard)
  @HttpCode(204)
  async registrationEmailResending(@Body() dto: AuthEmailValid) {
    const resendResult: boolean = await this.authServices.resendCode(dto.email);
    if (!resendResult) {
      throw new BadRequestException();
    }
    return true;
  }

  @Post('password-recovery')
  @UseGuards(RateLimitGuard)
  @HttpCode(204)
  async passwordRecovery(@Body() dto: AuthEmailValid) {
    await this.authServices.refreshPassword(dto.email);

    return;
  }

  @Post('new-password')
  @UseGuards(RateLimitGuard)
  @HttpCode(204)
  async newPassword(@Body() dto: AuthNewPassValid) {
    const result: boolean = await this.authServices.setNewPassword(
      dto.newPassword,
      dto.recoveryCode,
    );

    if (!result) {
      throw new BadRequestException();
    }
    return true;
  }
}
