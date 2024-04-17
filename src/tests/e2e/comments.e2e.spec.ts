// import { Test, TestingModule } from '@nestjs/testing';
// import { AppModule } from '../../app.module';
// import { AppSettings } from '../../app.settings';
// import request from 'supertest';
// import { HttpStatus } from '@nestjs/common';
// import { UsersMainType } from '../../5-dtos/users.types';
// import { BlogsMainType } from '../../5-dtos/blog.types';
// import { PostsMainType } from '../../5-dtos/posts.types';
// import { CommentsMainType } from '../../5-dtos/comments.types';
// import { UsersTestData, UsersTestManager } from './utils/users.test.manager';
//
// describe('comments_CRUD', () => {
//   let app;
//   let httpServer;
//
//   let createdUser: UsersMainType;
//   let token_User: string;
//   const password_User: string = UsersTestData.correctCreateUser.password;
//
//   let createdBlog: BlogsMainType;
//   let createdPost: PostsMainType;
//   let createdComment: CommentsMainType;
//
//   beforeAll(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();
//
//     app = moduleFixture.createNestApplication();
//     AppSettings(app);
//     await app.init();
//     httpServer = app.getHttpServer();
//
//     await request(httpServer)
//       .delete('/testing/all-data')
//       .expect(HttpStatus.NO_CONTENT);
//   });
//
//   afterAll(async () => {
//     await app.close();
//   });
//
//   it('should create user with correct data', async () => {
//     const response = await UsersTestManager.createUser(
//       UsersTestData.correctCreateUser,
//       httpServer,
//       HttpStatus.CREATED,
//     );
//     createdUser = response.body;
//   });
//   it('shouldn`t login with incorrect data', async () => {
//     await request(app) //incorrect EmailOrLogin
//       .post(`${RouterPath.auth}/login`)
//       .send({
//         loginOrEmail: createdUser.login + 'qw',
//         password: password_User,
//       })
//       .expect(HTTP_STATUSES.UNAUTHORIZED_401);
//
//     await request(app) //incorrect Password
//       .post(`${RouterPath.auth}/login`)
//       .send({
//         loginOrEmail: createdUser.login,
//         password: password_User + 'qw',
//       })
//       .expect(HTTP_STATUSES.UNAUTHORIZED_401);
//
//     await request(app) //not String EmailOrLogin
//       .post(`${RouterPath.auth}/login`)
//       .send({
//         loginOrEmail: [1, 2, 3, 4],
//         password: password_User,
//       })
//       .expect(HTTP_STATUSES.BAD_REQUEST_400);
//
//     await request(app) //not String Password
//       .post(`${RouterPath.auth}/login`)
//       .send({
//         loginOrEmail: createdUser.login,
//         password: [1, 2, 3, 4],
//       })
//       .expect(HTTP_STATUSES.BAD_REQUEST_400);
//   });
//   it('should login with email correct', async () => {
//     const response = await request(app)
//       .post(`${RouterPath.auth}/login`)
//       .set('x-forwarded-for', '12345')
//       .set('user-agent', '12345')
//       .send({
//         loginOrEmail: 'email@gmail.com',
//         password: 'password',
//       })
//       .expect(HTTP_STATUSES.OK_200);
//
//     console.log(response.body);
//   });
//   it('should login with correct login', async () => {
//     const delay = new Promise<void>((resolve, reject) => {
//       setTimeout(() => {
//         resolve();
//       }, 10000);
//     });
//
//     await delay;
//
//     const response = await request(app)
//       .post(`${RouterPath.auth}/login`)
//       .set('x-forwarded-for', '12345')
//       .set('user-agent', '12345')
//       .send({
//         loginOrEmail: createdUser.login,
//         password: 'password',
//       })
//       .expect(HTTP_STATUSES.OK_200);
//
//     token_User = response.body.accessToken;
//   }, 30000);
//   it('should create post with correct data', async () => {
//     createdBlog = await createBlogUtils();
//
//     const data: PostsCreateUpdate = {
//       title: 'string',
//       shortDescription: 'string',
//       content: 'string',
//       blogId: createdBlog.id,
//     };
//
//     const response = await request(app)
//       .post(RouterPath.posts)
//       .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
//       .send(data)
//       .expect(HTTP_STATUSES.CREATED_201);
//
//     expect(response.body).toEqual({
//       id: expect.any(String),
//       ...data,
//       blogName: createdBlog.name,
//       createdAt: expect.any(String),
//       extendedLikesInfo: expect.any(Object),
//     });
//
//     createdPost = response.body;
//
//     await request(app)
//       .get(`${RouterPath.posts}/${createdPost.id}`)
//       .expect(HTTP_STATUSES.OK_200, createdPost);
//   });
//   it('should create comment for post with using jwt', async () => {
//     const response = await request(app)
//       .post(`${RouterPath.posts}/${createdPost.id}/comments`)
//       .set('Authorization', `Bearer ${token_User}`)
//       .send({
//         content: 'qwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiop',
//       })
//       .expect(HTTP_STATUSES.CREATED_201);
//
//     createdComment = response.body;
//   });
//   it('shouldn`t create comment for unexpected/incorrect data post with using jwt', async () => {
//     const response = await request(app)
//       .post(`${RouterPath.posts}/yuibiyubu/comments`)
//       .set('Authorization', `Bearer ${token_User}`)
//       .send({
//         content: 'qwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiop',
//       })
//       .expect(HTTP_STATUSES.BAD_REQUEST_400);
//
//     expect(response.body).toEqual({
//       errorsMessages: [{ message: expect.any(String), field: 'id' }],
//     });
//
//     await request(app)
//       .post(`${RouterPath.posts}/111122223333444455556666/comments`)
//       .set('Authorization', `Bearer ${token_User}`)
//       .send({
//         content: 'qwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiop',
//       })
//       .expect(HTTP_STATUSES.NOT_FOUND_404);
//   });
//   it('shouldn`t update comment which is not yours', async () => {
//     const data: UsersCreate = {
//       login: 'loginnnn',
//       password: 'passwordddd',
//       email: 'emaillll@gmail.com',
//     };
//
//     await request(app)
//       .post(RouterPath.users)
//       .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
//       .send(data)
//       .expect(HTTP_STATUSES.CREATED_201);
//
//     const token = await request(app)
//       .post(`${RouterPath.auth}/login`)
//       .set('x-forwarded-for', '12345')
//       .set('user-agent', '12345')
//       .send({ loginOrEmail: 'loginnnn', password: 'passwordddd' })
//       .expect(HTTP_STATUSES.OK_200);
//
//     const comment = await request(app)
//       .post(`${RouterPath.posts}/${createdPost.id}/comments`)
//       .set('Authorization', `Bearer ${token.body.accessToken}`)
//       .send({
//         content: 'qwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiop',
//       })
//       .expect(HTTP_STATUSES.CREATED_201);
//
//     await request(app)
//       .put(`${RouterPath.comments}/${comment.body.id}`)
//       .set('Authorization', `Bearer ${token_User}`)
//       .send({
//         content: 'qwertyuiopasdfghjkl;zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz',
//       })
//       .expect(HTTP_STATUSES.FORBIDDEN_403);
//   });
//   it('should update comment for post with using jwt', async () => {
//     const response = await request(app)
//       .put(`${RouterPath.comments}/${createdComment.id}`)
//       .set('Authorization', `Bearer ${token_User}`)
//       .send({
//         content:
//           'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
//       })
//       .expect(HTTP_STATUSES.NO_CONTENT_204);
//
//     await request(app)
//       .get(`${RouterPath.comments}/${createdComment.id}`)
//       .expect({
//         ...createdComment,
//         content:
//           'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
//       });
//   });
//   it('shouldn`t update comment for post with incorrect data by using jwt', async () => {
//     const response = await request(app)
//       .put(`${RouterPath.comments}/${createdComment.id}`)
//       .set('Authorization', `Bearer ${token_User}`)
//       .send({ content: 123 })
//       .expect(HTTP_STATUSES.BAD_REQUEST_400);
//
//     expect(response.body).toEqual({
//       errorsMessages: [{ message: expect.any(String), field: 'content' }],
//     });
//
//     await request(app)
//       .get(`${RouterPath.comments}/${createdComment.id}`)
//       .expect({
//         ...createdComment,
//         content:
//           'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
//       });
//   });
//   it('shouldn`t delete unexpected comment or incorrect ObjectId ', async () => {
//     const response = await request(app)
//       .delete(`${RouterPath.comments}/${createdComment.id}1234`)
//       .set('Authorization', `Bearer ${token_User}`)
//       .expect(HTTP_STATUSES.BAD_REQUEST_400);
//
//     expect(response.body).toEqual({
//       errorsMessages: [{ message: expect.any(String), field: 'id' }],
//     });
//
//     await request(app)
//       .delete(`${RouterPath.comments}/111122223333444455556666`)
//       .set('Authorization', `Bearer ${token_User}`)
//       .expect(HTTP_STATUSES.NOT_FOUND_404);
//   });
//
//   it('should delete comment correct', async () => {
//     await request(app)
//       .delete(`${RouterPath.comments}/${createdComment.id}`)
//       .set('Authorization', `Bearer ${token_User}`)
//       .expect(HTTP_STATUSES.NO_CONTENT_204);
//
//     await request(app)
//       .get(`${RouterPath.comments}/${createdComment.id}`)
//       .expect(HTTP_STATUSES.NOT_FOUND_404);
//   });
// });
