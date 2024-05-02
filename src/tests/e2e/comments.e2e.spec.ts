import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { AppSettings } from '../../app.settings';
import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { UsersTestData, UsersTestManager } from './utils/users.test.manager';
import { BlogsTestData, BlogsTestManager } from './utils/blogs.test.manager';
import { PostsTestData, PostsTestManager } from './utils/posts.test.manager';
import {
  CommentsTestData,
  CommentsTestManager,
} from './utils/comments.test.manager';
import { ObjectId } from 'mongodb';

describe('comments_CRUD', () => {
  let app;
  let httpServer;

  let token_User: string;
  let createdPost;
  let createdComment;

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

  it('should create user and login', async () => {
    await UsersTestManager.createUser(
      UsersTestData.correctCreateUser,
      httpServer,
      HttpStatus.CREATED,
    );

    const { accessToken } = await UsersTestManager.loginUser(
      UsersTestData.loginCreateUser,
      httpServer,
      HttpStatus.OK,
    );

    token_User = accessToken;
  });

  it('should create post with correct data', async () => {
    const result = await BlogsTestManager.createBlog(
      BlogsTestData.correctCreateBlog,
      httpServer,
      HttpStatus.CREATED,
    );

    const result_2 = await PostsTestManager.createPost(
      {
        ...PostsTestData.correctCreatePost_WITHOUT_blogId,
        blogId: result.body.id,
      },
      httpServer,
      HttpStatus.CREATED,
    );

    createdPost = result_2.body;
  });
  it('should create comment for post', async () => {
    const response = await CommentsTestManager.createComment(
      {
        postId: createdPost.id,
        accessToken: token_User,
        create: CommentsTestData.correctCreateComment,
      },
      httpServer,
      HttpStatus.CREATED,
    );

    createdComment = response.body;
  });
  it('shouldn`t create comment for unexpected/incorrect data post', async () => {
    await CommentsTestManager.createComment(
      {
        postId: '12345',
        accessToken: token_User,
        create: CommentsTestData.correctCreateComment,
      },
      httpServer,
      HttpStatus.BAD_REQUEST,
    );

    await CommentsTestManager.createComment(
      {
        postId: new ObjectId().toString(),
        accessToken: token_User,
        create: CommentsTestData.correctCreateComment,
      },
      httpServer,
      HttpStatus.NOT_FOUND,
    );
  });
  it('shouldn`t update comment which is not yours', async () => {
    await UsersTestManager.createUser(
      UsersTestData.correctCreateUser_2,
      httpServer,
      HttpStatus.CREATED,
    );

    const { accessToken } = await UsersTestManager.loginUser(
      UsersTestData.loginCreateUser_2,
      httpServer,
      HttpStatus.OK,
    );

    await CommentsTestManager.updateComment(
      {
        commentId: createdComment.id,
        token: accessToken,
        content: CommentsTestData.correctUpdateComment,
      },
      httpServer,
      HttpStatus.FORBIDDEN,
    );
  });
  it('should update comment', async () => {
    const { changeComment } = await CommentsTestManager.updateComment(
      {
        commentId: createdComment.id,
        token: token_User,
        content: CommentsTestData.correctUpdateComment,
      },
      httpServer,
      HttpStatus.NO_CONTENT,
    );
    createdComment = changeComment;
  });
  it('shouldn`t update comment with incorrect data', async () => {
    const { result } = await CommentsTestManager.updateComment(
      {
        commentId: createdComment.id,
        token: token_User,
        content: CommentsTestData.incorrectCreateUpdateComment,
      },
      httpServer,
      HttpStatus.BAD_REQUEST,
    );

    expect(result.body).toEqual({
      errorsMessages: [{ message: expect.any(String), field: 'content' }],
    });

    await request(httpServer)
      .get(`/comments/${createdComment.id}`)
      .expect({
        ...createdComment,
      });
  });
  it('shouldn`t delete unexpected comment', async () => {
    await request(httpServer)
      .delete('/comments/1234')
      .set('Authorization', `Bearer ${token_User}`)
      .expect(HttpStatus.BAD_REQUEST);

    await request(httpServer)
      .delete(`/comments/${new ObjectId()}`)
      .set('Authorization', `Bearer ${token_User}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should delete comment correct', async () => {
    await request(httpServer)
      .delete(`/comments/${createdComment.id}`)
      .set('Authorization', `Bearer ${token_User}`)
      .expect(HttpStatus.NO_CONTENT);

    await request(httpServer)
      .get(`/comments/${createdComment.id}`)
      .expect(HttpStatus.NOT_FOUND);
  });
});
