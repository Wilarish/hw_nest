import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UsersRepository } from '../../2-repositories/users.repository';
import { UsersMainType } from '../../5-dtos/users.types';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../8-config/get.configuration';

@Injectable()
export class BearerAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersRepository: UsersRepository,
    private readonly configService: ConfigService<ConfigType>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('SECRET_JWT', { infer: true }),
      });

      const user: UsersMainType | null =
        await this.usersRepository.findUserById(payload.userId.toString());
      if (!user) {
        throw new UnauthorizedException();
      }

      request['userId'] = payload.userId;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
@Injectable()
export class BearerAuthGuardWithout401Exception implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService<ConfigType>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      return true;
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('SECRET_JWT', { infer: true }),
      });

      const user: UsersMainType | null =
        await this.usersRepository.findUserById(payload.userId.toString());
      if (!user) {
        return true;
      }

      request['userId'] = payload.userId;
    } catch {
      return true;
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
