import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../0-controllers/users.controller';
import { UsersService } from '../../1-services/users.service';
import { UsersTestData } from '../e2e/utils/users.test.manager';
import { BcryptAdapter } from '../../4-adapters/bcrypt.adapter';
import { UsersRepository } from '../../2-repositories/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { mongoURI } from '../../db.connectino.string';
import { UsersMainClass, UsersSchema } from '../../3-schemas/users.scema';
import { UsersQueryRepository } from '../../2-repositories/query/users.query.repository';
import { AuthController } from '../../0-controllers/auth.controller';
import { AuthServices } from '../../1-services/auth.services';
import { DevicesRepository } from '../../2-repositories/devices.repository';
import { DeviceSchema, DevicesMainClass } from '../../3-schemas/devices.schema';
import { JwtModule } from '@nestjs/jwt';
import { AppModule } from '../../app.module';

describe('Email_Adapter_Tests', () => {
  let authController: AuthController;
  let authServices: AuthServices;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    authServices = moduleFixture.get<AuthServices>(AuthServices);
    authController = moduleFixture.get<AuthController>(AuthController);
  });

  it('should access token', async () => {
    //const user await
    const result = true;
    //const spy = jest.spyOn(authServices, 'createUser').mockImplementation();

    const req = await authServices.createUser(UsersTestData.correctCreateUser);
    console.log(req);
    expect(req).toEqual(result);
    //expect(spy).toBeCalled();
  });
});
