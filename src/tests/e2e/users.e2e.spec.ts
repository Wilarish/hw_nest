import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersMainType } from '../../5-dtos/users.types';
import { Paginated } from '../../5-dtos/pagination.types';
import { AppModule } from '../../app.module';
import { AppSettings } from '../../app.settings';
import { UsersTestData, UsersTestManager } from './utils/users.test.manager';
import { ObjectId } from 'mongodb';

describe('users_CRUD', () => {
  let app: INestApplication;
  let httpServer;
  let createdUser: any;
  let createdUser_2: any;
  const expectedPaginatedResult: Paginated<UsersMainType> = {
    pagesCount: expect.any(Number),
    page: expect.any(Number),
    pageSize: expect.any(Number),
    totalCount: expect.any(Number),
    items: expect.any(Array),
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

  it('should return 200 and empty array', async () => {
    const res = await request(httpServer)
      .get('/users')
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(HttpStatus.OK);
    expect(res.body).toEqual(expectedPaginatedResult);
  });

  it('should create user with correct data', async () => {
    const response = await UsersTestManager.createUser(
      UsersTestData.correctCreateUser,
      httpServer,
      HttpStatus.CREATED,
    );

    expect(response.body).toEqual({
      id: response.body.id,
      login: response.body.login,
      email: response.body.email,
      createdAt: response.body.createdAt,
    });

    createdUser = response.body;

    const res = await request(httpServer)
      .get('/users')
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(expectedPaginatedResult);
    expect(res.body.items).toEqual([createdUser]);
  });
  it('should create user_2 with correct data', async () => {
    const response = await UsersTestManager.createUser(
      UsersTestData.correctCreateUser_2,
      httpServer,
      HttpStatus.CREATED,
    );

    expect(response.body).toEqual({
      id: response.body.id,
      login: response.body.login,
      email: response.body.email,
      createdAt: response.body.createdAt,
    });

    createdUser_2 = response.body;

    const res = await request(httpServer)
      .get('/users')
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(expectedPaginatedResult);
    expect(res.body.items).toEqual([createdUser_2, createdUser]);
  });
  it('shouldn`t create user with incorrect data', async () => {
    const result = await UsersTestManager.createUser(
      UsersTestData.incorrectCreateUser,
      httpServer,
      HttpStatus.BAD_REQUEST,
    );

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

  it('should delete user', async () => {
    await request(httpServer)
      .delete(`/users/${createdUser.id}`)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(HttpStatus.NO_CONTENT);

    await request(httpServer)
      .get(`/users/${createdUser.id}`)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(HttpStatus.NOT_FOUND);
  });
  it('shouldn`t delete unexpected user', async () => {
    await request(httpServer)
      .get(`/users/${new ObjectId()}`)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(HttpStatus.NOT_FOUND);
  });
});
