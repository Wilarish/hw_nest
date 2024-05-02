import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../1-services/users.service';
import { UsersRepository } from '../2-repositories/users.repository';
import { UsersMainType } from '../5-dtos/users.types';
import * as cluster from 'cluster';

@Injectable()
export class JwtAdapter {
  constructor(
    private jwtService: JwtService,
    private userRepository: UsersRepository,
  ) {}

  async createAccessJwt(userId: string) {
    return this.jwtService.signAsync({ userId }, { expiresIn: '30m' });
  }

  async createRefreshJwt(userId: string, deviceId: string) {
    return this.jwtService.signAsync(
      { userId, deviceId },
      { expiresIn: '35m' },
    );
  }

  async getPayloadOfJwt(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'qwerty',
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
        secret: 'qwerty',
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
