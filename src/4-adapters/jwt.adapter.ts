import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../2-repositories/users.repository';
import { UsersMainType } from '../5-dtos/users.types';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../8-config/get.configuration';

@Injectable()
export class JwtAdapter {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UsersRepository,
    private readonly configService: ConfigService<ConfigType>,
  ) {}

  async createAccessJwt(userId: string) {
    return this.jwtService.signAsync(
      { userId },
      {
        expiresIn: '30m',
        secret: this.configService.get('SECRET_JWT', { infer: true }),
      },
    );
  }

  async createRefreshJwt(userId: string, deviceId: string) {
    return this.jwtService.signAsync(
      { userId, deviceId },
      {
        expiresIn: '35m',
        secret: this.configService.get('SECRET_JWT', { infer: true }),
      },
    );
  }

  async getPayloadOfJwt(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('SECRET_JWT', { infer: true }),
      });
      return payload;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async findUserByToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('SECRET_JWT', { infer: true }),
      });
      const user: UsersMainType | null = await this.userRepository.findUserById(
        payload.userId,
      );
      if (!user) {
        return null;
      }
      return payload;
    } catch (err) {
      console.log(err);
      return null;
    }
  }
  async refreshToken(token: string) {
    const payloadOldToken = await this.findUserByToken(token);

    if (!payloadOldToken) return null;

    const refreshToken: string = await this.createRefreshJwt(
      payloadOldToken.userId,
      payloadOldToken.deviceId,
    );
    const accessToken: string = await this.createAccessJwt(
      payloadOldToken.userId,
    );

    const payloadNewToken: any = await this.getPayloadOfJwt(refreshToken);

    return {
      refreshToken: {
        token: refreshToken,
        payload: payloadNewToken,
      },
      accessToken,
    };
  }
}
