import request from 'supertest';
import { HttpStatus } from '@nestjs/common';

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
  incorrectCreateUser: {
    login: 123,
    email: 123,
    password: 123,
  },
};
