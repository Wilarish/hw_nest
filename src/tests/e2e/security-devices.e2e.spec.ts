import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { AppSettings } from '../../app.settings';
import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { UsersTestData, UsersTestManager } from './utils/users.test.manager';
import { ObjectId } from 'mongodb';

describe('devices_tests', () => {
  let app;
  let httpServer;
  let refreshToken_user_2;
  let refreshToken;
  let refreshToken_2;
  let refreshToken_3;
  let refreshToken_4;
  let deviceId;
  let deviceIdUser_2;

  const deviceView = {
    ip: expect.any(String),
    deviceId: expect.any(String),
    title: expect.any(String),
    lastActiveDate: expect.any(String),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    AppSettings(app);
    await app.init();
    httpServer = app.getHttpServer();

    await request(httpServer)
      .delete('/testing/all-data')
      .expect(HttpStatus.NO_CONTENT);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create and login users', async () => {
    await UsersTestManager.createUser(
      UsersTestData.correctCreateUser,
      httpServer,
      HttpStatus.CREATED,
    );
    await UsersTestManager.createUser(
      UsersTestData.correctCreateUser_2,
      httpServer,
      HttpStatus.CREATED,
    );
    const result_user_2 = await UsersTestManager.loginUser(
      UsersTestData.loginCreateUser_2,
      httpServer,
      HttpStatus.OK,
    );
    const result_1 = await UsersTestManager.loginUser(
      UsersTestData.loginCreateUser,
      httpServer,
      HttpStatus.OK,
    );
    const result_2 = await UsersTestManager.loginUser(
      UsersTestData.loginCreateUser,
      httpServer,
      HttpStatus.OK,
    );
    const result_3 = await UsersTestManager.loginUser(
      UsersTestData.loginCreateUser,
      httpServer,
      HttpStatus.OK,
    );
    const result_4 = await UsersTestManager.loginUser(
      UsersTestData.loginCreateUser,
      httpServer,
      HttpStatus.OK,
    );

    refreshToken = result_1.refreshToken;
    refreshToken_2 = result_2.refreshToken;
    refreshToken_3 = result_3.refreshToken;
    refreshToken_4 = result_4.refreshToken;
    refreshToken_user_2 = result_user_2.refreshToken;
  });
  it('shouldn`t get devices by refreshToken ', async () => {
    await request(httpServer)
      .get('/security/devices')
      .set('Cookie', 'not refresh token')
      .expect(HttpStatus.UNAUTHORIZED);
  });
  it('should get devices by all refreshTokens', async () => {
    const result_user_2 = await request(httpServer)
      .get('/security/devices')
      .set('Cookie', refreshToken_user_2)
      .expect(HttpStatus.OK);

    const result = await request(httpServer)
      .get('/security/devices')
      .set('Cookie', refreshToken)
      .expect(HttpStatus.OK);

    const result_2 = await request(httpServer)
      .get('/security/devices')
      .set('Cookie', refreshToken_2)
      .expect(HttpStatus.OK);

    const result_3 = await request(httpServer)
      .get('/security/devices')
      .set('Cookie', refreshToken_3)
      .expect(HttpStatus.OK);

    const result_4 = await request(httpServer)
      .get('/security/devices')
      .set('Cookie', refreshToken_4)
      .expect(HttpStatus.OK);

    expect(result.body.length).toBe(4);
    expect(result_2.body.length).toBe(4);
    expect(result_3.body.length).toBe(4);
    expect(result_4.body.length).toBe(4);
    expect(result_user_2.body.length).toBe(1);

    expect(result.body[0]).toEqual(deviceView);

    deviceId = result.body[0].deviceId;
    deviceIdUser_2 = result_user_2.body[0].deviceId;
  });
  it('shouldn`t delete unexpected/not this user device by id ', async () => {
    await request(httpServer)
      .delete(`/security/devices/${new ObjectId()}`)
      .set('Cookie', refreshToken)
      .expect(HttpStatus.NOT_FOUND);

    await request(httpServer)
      .delete(`/security/devices/${deviceId}`)
      .set('Cookie', 'not refresh token')
      .expect(HttpStatus.UNAUTHORIZED);

    await request(httpServer)
      .delete(`/security/devices/${deviceIdUser_2}`)
      .set('Cookie', refreshToken)
      .expect(HttpStatus.FORBIDDEN);
  });
  it('should delete device by id', async () => {
    await request(httpServer)
      .delete(`/security/devices/${deviceId}`)
      .set('Cookie', refreshToken)
      .expect(HttpStatus.NO_CONTENT);

    await request(httpServer)
      .get('/security/devices')
      .set('Cookie', refreshToken)
      .expect(HttpStatus.UNAUTHORIZED);

    const result_2 = await request(httpServer)
      .get('/security/devices')
      .set('Cookie', refreshToken_2)
      .expect(HttpStatus.OK);

    expect(result_2.body.length).toBe(3);
  });
  it('shouldn`t delete all other devices', async () => {
    await request(httpServer)
      .delete(`/security/devices/`)
      .set('Cookie', 'not refresh token')
      .expect(HttpStatus.UNAUTHORIZED);
  });
  it('should delete all other devices', async () => {
    await request(httpServer)
      .delete(`/security/devices/`)
      .set('Cookie', refreshToken_2)
      .expect(HttpStatus.NO_CONTENT);

    const result = await request(httpServer)
      .get('/security/devices')
      .set('Cookie', refreshToken_2)
      .expect(HttpStatus.OK);

    expect(result.body.length).toBe(1);

    await request(httpServer)
      .get('/security/devices')
      .set('Cookie', refreshToken_3)
      .expect(HttpStatus.UNAUTHORIZED);

    await request(httpServer)
      .get('/security/devices')
      .set('Cookie', refreshToken_4)
      .expect(HttpStatus.UNAUTHORIZED);
  });
});
