import { Test, TestingModule } from '@nestjs/testing';
import { UsersTestData } from '../e2e/utils/users.test.manager';
import { AuthController } from '../../0-controllers/auth.controller';
import { AuthServices } from '../../1-services/auth.services';
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
