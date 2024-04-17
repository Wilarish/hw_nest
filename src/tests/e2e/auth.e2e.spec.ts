import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { AppSettings } from '../../app.settings';
import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { UsersMainType } from '../../5-dtos/users.types';
import { UsersTestData, UsersTestManager } from './utils/users.test.manager';
import { UsersRepository } from '../../2-repositories/users.repository';

describe('auth', () => {
  let app;
  let httpServer;
  let usersRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    AppSettings(app);
    await app.init();
    httpServer = app.getHttpServer();

    usersRepository = moduleFixture.get<UsersRepository>(UsersRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('registration_emailConfirmation', () => {
    let regUserFromDb: UsersMainType | null;
    let expiredCode: string;

    beforeAll(async () => {
      await request(httpServer)
        .delete('/testing/all-data')
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should create users with registration', async () => {
      await UsersTestManager.createUserWithRegistration(
        UsersTestData.correctCreateUser,
        httpServer,
        HttpStatus.NO_CONTENT,
      );

      expiredCode =
        await UsersTestManager.createUserWithExpiredEmailCode(usersRepository);

      regUserFromDb = await usersRepository.findUserByLoginOrEmail(
        UsersTestData.correctCreateUser.email,
      );

      const response = await request(httpServer)
        .get(`/users/${regUserFromDb?._id}`)
        .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        id: regUserFromDb?._id.toString(),
        login: regUserFromDb?.login,
        email: regUserFromDb?.email,
        createdAt: regUserFromDb?.createdAt,
      });
    });
    it('shouldn`t create user with registration and incorrect data', async () => {
      const result = await request(httpServer)
        .post(`/auth/registration`)
        .send(UsersTestData.incorrectCreateUser)
        .expect(HttpStatus.BAD_REQUEST);

      expect(result.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'login',
          },
          {
            message: expect.any(String),
            field: 'password',
          },
          {
            message: expect.any(String),
            field: 'email',
          },
        ],
      });
    });
    it('should resend email with new code correct', async () => {
      await request(httpServer)
        .post(`/auth/registration-email-resending`)
        .send({ email: regUserFromDb?.email })
        .expect(HttpStatus.NO_CONTENT);

      const updatedUser = await usersRepository.findUserByLoginOrEmail(
        UsersTestData.correctCreateUser.email,
      );

      expect(regUserFromDb?.emailConfirmation.confirmationCode).not.toEqual(
        updatedUser?.emailConfirmation.confirmationCode,
      );

      regUserFromDb!.emailConfirmation = updatedUser!.emailConfirmation;
    });

    it('shouldn`t resend code on not existed email', async () => {
      await request(httpServer)
        .post(`/auth/registration-email-resending`)
        .send({ email: '123@123.com' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('shouldn`t confirm registration correct', async () => {
      await request(httpServer)
        .post(`/auth/registration-confirmation`)
        .send({
          code: regUserFromDb!.emailConfirmation.confirmationCode + 'jjiopjopi',
        })
        .expect(HttpStatus.BAD_REQUEST);

      const result = await request(httpServer)
        .post(`/auth/registration-confirmation`)
        .send({
          code: expiredCode,
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(result.body).toEqual({
        errorsMessages: [
          { field: 'code', message: 'confirmation code is expired' },
        ],
      });
    });

    it('should confirm registration correct', async () => {
      await request(httpServer)
        .post(`/auth/registration-confirmation`)
        .send({ code: regUserFromDb!.emailConfirmation.confirmationCode })
        .expect(HttpStatus.NO_CONTENT);
    });
    it('shouldn`t confirm email second time', async () => {
      const result = await request(httpServer)
        .post(`/auth/registration-confirmation`)
        .send({ code: regUserFromDb!.emailConfirmation.confirmationCode })
        .expect(HttpStatus.BAD_REQUEST);

      expect(result.body).toEqual({
        errorsMessages: [
          {
            field: 'code',
            message:
              'user is already confirmed email or code is incorrect/expired',
          },
        ],
      });
    });
  });
  describe('login_me_refreshToken', () => {
    let refreshToken;
    let accessToken;
    let createdUser: UsersMainType;
    beforeAll(async () => {
      await request(httpServer)
        .delete('/testing/all-data')
        .expect(HttpStatus.NO_CONTENT);
    });
    it('should create user with correct data', async () => {
      const response = await UsersTestManager.createUser(
        UsersTestData.correctCreateUser,
        httpServer,
        HttpStatus.CREATED,
      );

      createdUser = response.body;
    });

    it('should response 401 because wrong login/email or password', async () => {
      await request(httpServer)
        .post('/auth/login')
        .send({
          loginOrEmail: UsersTestData.correctCreateUser.login + 'error',
          password: UsersTestData.correctCreateUser.password,
        })
        .expect(HttpStatus.UNAUTHORIZED);

      await request(httpServer)
        .post('/auth/login')
        .send({
          loginOrEmail: UsersTestData.correctCreateUser.login,
          password: UsersTestData.correctCreateUser.password + 'error',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should response 400 because wrong login/email or password', async () => {
      const result = await request(httpServer)
        .post('/auth/login')
        .send({
          loginOrEmail: 1234,
          password: 1234,
        })
        .expect(HttpStatus.BAD_REQUEST);
      expect(result.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'loginOrEmail',
          },
          {
            message: expect.any(String),
            field: 'password',
          },
        ],
      });
    });

    it('should login correct', async () => {
      const result = await request(httpServer)
        .post('/auth/login')
        .set('x-forwarded-for', '12345')
        .set('user-agent', '12345')
        .send({
          loginOrEmail: UsersTestData.correctCreateUser.login,
          password: UsersTestData.correctCreateUser.password,
        })
        .expect(HttpStatus.OK);
      refreshToken = result.header['set-cookie'];
      accessToken = result.body.accessToken;
    });
    it('shouldn`t return info with incorrect refreshToken', async () => {
      await request(httpServer)
        .get('/auth/me')
        .set('Cookie', ['refreshToken = wrong_Jwt_token'])
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('should return info about me', async () => {
      const result = await request(httpServer)
        .get('/auth/me')
        .set('Cookie', refreshToken)
        .expect(HttpStatus.OK);

      expect(result.body).toEqual({
        email: UsersTestData.correctCreateUser.email,
        login: UsersTestData.correctCreateUser.login,
        userId: expect.any(String),
      });
    });
    it('shouldn`t refresh token', async () => {
      await request(httpServer)
        .post('/auth/refresh-token')
        .set('Cookie', [`refreshToken = ${accessToken}`])
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('should refresh token correct', async () => {
      const result = await request(httpServer)
        .post('/auth/refresh-token')
        .set('Cookie', refreshToken)
        .expect(HttpStatus.OK);

      refreshToken = result.header['set-cookie'];
    });
    it('should logout correct', async () => {
      await request(httpServer)
        .post('/auth/logout')
        .set('Cookie', refreshToken)
        .expect(HttpStatus.NO_CONTENT);
    });
    it('shouldn`t return info after logout with refresh token', async () => {
      await request(httpServer)
        .get('/auth/me')
        .set('Cookie', refreshToken)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
