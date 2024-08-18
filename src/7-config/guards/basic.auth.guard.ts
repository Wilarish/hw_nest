import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../get.configuration';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService<ConfigType>) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authString = request.headers.authorization;

    if (!authString) throw new UnauthorizedException();

    let decode;

    const token = authString?.split(' ');
    const type = token[0];
    const encoded = token[1];

    try {
      decode = atob(encoded);
    } catch (err) {
      throw new UnauthorizedException();
    }

    if (
      type !== 'Basic' ||
      decode !== this.configService.get('ADMIN_LOGIN_PASSWORD', { infer: true })
    ) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
