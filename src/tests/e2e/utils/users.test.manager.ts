import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { UsersRepository } from '../../../2-repositories/users.repository';
import { UsersMainType } from '../../../5-dtos/users.types';
import { ObjectId } from 'mongodb';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export const UsersTestManager = {
  async createUser(data: any, httpServer: any, status: HttpStatus) {
    const result = await request(httpServer)
      .post('/users')
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(data)
      .expect(status);

    if (status === HttpStatus.CREATED) {
      await request(httpServer)
        .get(`/users/${result.body.id}`)
        .expect(HttpStatus.OK, result.body);
    }
    return result;
  },
  async createUserWithRegistration(
    data: any,
    httpServer: any,
    status: HttpStatus,
  ) {
    return request(httpServer)
      .post('/auth/registration')
      .send(data)
      .expect(status);
  },
  async createUserWithExpiredEmailCode(userRepository: UsersRepository) {
    const user: UsersMainType = {
      _id: new ObjectId(),
      login: 'expired',
      email: 'expired@ex.com',
      passwordSalt: '12345',
      passwordHash: '12345',
      createdAt: new Date().toISOString(),
      emailConfirmation: {
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), {
          hours: -2,
        }).toISOString(),
        isConfirmed: false,
      },
      passwordChanging: {
        setPasswordCode: 'none',
        expirationDate: 'none',
      },
    };
    await userRepository.createSaveUser(user);
    return user.emailConfirmation.confirmationCode;
  },
  async loginUser(data: any, httpServer, status: HttpStatus) {
    const result = await request(httpServer)
      .post('/auth/login')
      .send(data)
      .expect(status);
    if (status === HttpStatus.OK) {
      return {
        accessToken: result.body.accessToken,
        refreshToken: result.header['set-cookie'],
      };
    }
    return result.body;
  },
  // async updateUser(user: any, data: any, httpServer: any, status: HttpStatus) {
  //   const result = await request(httpServer)
  //     .put(`/users/${user.id}`)
  //     .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
  //     .send(data)
  //     .expect(status);
  //
  //   let changeUser;
  //
  //   if (status === HttpStatus.NO_CONTENT) {
  //     changeUser = await request(httpServer)
  //       .get(`/users/${user.id}`)
  //       .expect(HttpStatus.OK);
  //
  //     expect(changeUser.body).toEqual({
  //       id: user._id,
  //       login: user.login,
  //       email: user.email,
  //       createdAt: user.createdAt,
  //     });
  //   }
  //   return { changeUser: changeUser?.body, result };
  // },
};
export const UsersTestData = {
  correctCreateUser: {
    login: 'string',
    email: 'string@str.com',
    password: 'string12345',
  },
  correctCreateUser_2: {
    login: 'string2',
    email: 'string2@str.com',
    password: 'string1234567',
  },
  correctCreateUser_3: {
    login: 'string3',
    email: 'string3@str.com',
    password: 'string1',
  },
  correctCreateUser_4: {
    login: 'string4',
    email: 'string4@str.com',
    password: 'string1',
  },
  loginCreateUser: {
    loginOrEmail: 'string',
    password: 'string12345',
  },
  loginCreateUser_2: {
    loginOrEmail: 'string2',
    password: 'string1234567',
  },
  loginCreateUser_3: {
    loginOrEmail: 'string3',
    password: 'string1',
  },
  loginCreateUser_4: {
    loginOrEmail: 'string4',
    password: 'string1',
  },
  incorrectLoginUser: {
    loginOrEmail: 123,
    password: 123,
  },
  incorrectCreateUser: {
    login: 123,
    email: 123,
    password: 123,
  },
};
