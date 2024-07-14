import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export enum ExceptionsNames {
  BadRequest_400 = 'BadRequest',
  Unauthorized_401 = 'Unauthorized',
  Forbidden_403 = 'Forbidden',
  NotFound_404 = 'NotFound',
  InternalServerError_500 = 'InternalServerError',
}
export class ResponseToControllersHelper {
  constructor(
    public isError: boolean,
    public exceptionStatus: string | undefined = undefined,
    public responseData: object | string | undefined = undefined,
    public dataToController: any | undefined = undefined,
  ) {}
  static checkReturnException(response: ResponseToControllersHelper) {
    if (!response?.isError) {
      return response.responseData;
    }
    switch (response.exceptionStatus) {
      case ExceptionsNames.BadRequest_400:
        throw new BadRequestException();

      case ExceptionsNames.Unauthorized_401:
        throw new UnauthorizedException();

      case ExceptionsNames.Forbidden_403:
        throw new ForbiddenException();

      case ExceptionsNames.NotFound_404:
        throw new NotFoundException();

      case ExceptionsNames.InternalServerError_500:
        throw new InternalServerErrorException();
    }
  }
}
