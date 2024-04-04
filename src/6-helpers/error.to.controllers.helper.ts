import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ErrorToControllersHelper {
  returnStatus(request: any) {
    switch (request.status) {
      case 401:
        return new UnauthorizedException();

      case 204:
        return true;
    }
  }
}
