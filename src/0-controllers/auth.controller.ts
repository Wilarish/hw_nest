import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { UsersCreateValid } from '../7-config/validation-pipes/users.pipes';
import { EmailServices } from '../1-services/email-service';
import { AuthServices } from '../1-services/auth.services';
import { UsersRepository } from '../2-repositories/users.repository';
import { ObjectId } from 'mongodb';

@Controller('auth')
export class AuthController {
  constructor(
    private authServices: AuthServices,
    private emailServices: EmailServices,
    private usersRepository: UsersRepository,
  ) {}
  @Get()
  async Test(@Body() dto: any) {
    return this.usersRepository.findUserById(dto._id);
  }
  @Post('registration')
  @HttpCode(204)
  async registration(@Body() dto: UsersCreateValid) {
    const regResult: boolean = await this.authServices.createUser(dto);
    if (!regResult) {
      throw new InternalServerErrorException();
    }
    return true;
  }
  @Post('registration-confirmation')
  @HttpCode(204)
  async registrationConfirmation(@Body() dto: { code: string }) {
    const confirmResult: boolean = await this.authServices.confirmEmail(
      dto!.code,
    );
    if (!confirmResult) {
      throw new BadRequestException();
    }
    return true;
  }

  @Post('registration-email-resending')
  @HttpCode(204)
  async registrationEmailResending(@Body() dto: { email: string }) {
    const resendResult: boolean = await this.authServices.resendCode(dto.email);
    if (!resendResult) {
      throw new BadRequestException();
    }
    return true;
  }

  @Post('password-recovery')
  @HttpCode(204)
  async passwordRecovery(@Body() dto: { email: string }) {
    await this.authServices.refreshPassword(dto.email);

    return;
  }

  @Post('new-password')
  @HttpCode(204)
  async newPassword(
    @Body() dto: { newPassword: string; recoveryCode: string },
  ) {
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
