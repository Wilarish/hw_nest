import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class BasicAuthGuard implements CanActivate {
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

    if (type !== 'Basic' || decode !== 'admin:qwerty') {
      throw new UnauthorizedException();
    }

    return true;
  }
}
