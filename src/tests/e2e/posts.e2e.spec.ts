import request from 'supertest';
import { PostsMainType } from '../../5-dtos/posts.types';
import { Paginated } from '../../5-dtos/pagination.types';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { AppSettings } from '../../app.settings';
import { HttpStatus } from '@nestjs/common';
import { PostsCreateUpdateValidate } from '../../7-config/validation-pipes/posts.pipes';
import { BlogsTestData, BlogsTestManager } from './utils/blogs.test.manager';
import { PostsTestData, PostsTestManager } from './utils/posts.test.manager';
import { ObjectId } from 'mongodb';

describe('/posts_CRUD', () => {
  let app;
  let httpServer;
  let createdPost;
  let createdPost_2;
  let createdBlog;
  let createdBlog_2;

  const expectedPaginatedResult: Paginated<PostsMainType> = {
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
    const res = await request(httpServer).get('/posts').expect(HttpStatus.OK);
    expect(res.body).toEqual(expectedPaginatedResult);
  });

  it('should create post and blogs with correct data', async () => {
    const resultBlogCreate = await BlogsTestManager.createBlog(
      BlogsTestData.correctCreateBlog,
      httpServer,
      HttpStatus.CREATED,
    );
    const resultBlog_2Create = await BlogsTestManager.createBlog(
      BlogsTestData.correctCreateBlog_2,
      httpServer,
      HttpStatus.CREATED,
    );
    createdBlog_2 = resultBlog_2Create.body;
    createdBlog = resultBlogCreate.body;

    const response = await PostsTestManager.createPost(
      {
        ...PostsTestData.correctCreatePost_WITHOUT_blogId,
        blogId: createdBlog.id,
      },
      httpServer,
      HttpStatus.CREATED,
    );

    expect(response.body).toEqual({
      id: expect.any(String),
      ...PostsTestData.correctCreatePost_WITHOUT_blogId,
      blogName: createdBlog.name,
      blogId: createdBlog.id,
      createdAt: expect.any(String),
      extendedLikesInfo: expect.any(Object),
    });

    createdPost = response.body;

    await request(httpServer)
      .get(`/posts/${createdPost.id}`)
      .expect(HttpStatus.OK, createdPost);
  });
  it('should create post_2 with correct data', async () => {
    const response = await PostsTestManager.createPost(
      {
        ...PostsTestData.correctCreatePost_2_WITHOUT_blogId,
        blogId: createdBlog_2.id,
      },
      httpServer,
      HttpStatus.CREATED,
    );

    expect(response.body).toEqual({
      id: expect.any(String),
      ...PostsTestData.correctCreatePost_2_WITHOUT_blogId,
      blogName: createdBlog_2.name,
      blogId: createdBlog_2.id,
      createdAt: expect.any(String),
      extendedLikesInfo: expect.any(Object),
    });

    createdPost_2 = response.body;

    const res = await request(httpServer).get('/posts').expect(HttpStatus.OK);

    expect(res.body).toEqual({ ...expectedPaginatedResult, totalCount: 2 });
    expect(res.body.items).toEqual([createdPost_2, createdPost]);
  });
  it('shouldn`t create post with incorrect data', async () => {
    const response = await PostsTestManager.createPost(
      PostsTestData.incorrectCreateUpdatePost,
      httpServer,
      HttpStatus.BAD_REQUEST,
    );
    expect(response.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'title',
        },
        {
          message: expect.any(String),
          field: 'shortDescription',
        },
        {
          message: expect.any(String),
          field: 'content',
        },
        {
          message: expect.any(String),
          field: 'blogId',
        },
      ],
    });
  });
  it('should update "blogName" when field "name" in blog has been updated', async () => {
    const result = await BlogsTestManager.updateBlog(
      createdBlog_2,
      BlogsTestData.correctUpdateBlog,
      httpServer,
      HttpStatus.NO_CONTENT,
    );

    await request(httpServer)
      .get(`/posts/${createdPost_2.id}`)
      .expect(HttpStatus.OK, {
        ...createdPost_2,
        blogName: result.changeBlog.name,
      });
  });
  it('shouldn`t update post ', async () => {
    const { result } = await PostsTestManager.updatePost(
      createdPost,
      PostsTestData.incorrectCreateUpdatePost,
      httpServer,
      HttpStatus.BAD_REQUEST,
    );

    expect(result.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'title',
        },
        {
          message: expect.any(String),
          field: 'shortDescription',
        },
        {
          message: expect.any(String),
          field: 'content',
        },
        {
          message: expect.any(String),
          field: 'blogId',
        },
      ],
    });
  });
  it('shouldn`t update unexpected post ', async () => {
    const data: PostsCreateUpdateValidate = {
      title: 'qqqqqqq',
      shortDescription: 'qqqqqq',
      content: 'sqqqqqqq',
      blogId: createdBlog.id,
    };

    await request(httpServer)
      .put(`/posts/${new ObjectId()}`)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(data)
      .expect(HttpStatus.NOT_FOUND);
  });
  it('should update post correct ', async () => {
    await PostsTestManager.updatePost(
      createdPost,
      {
        ...PostsTestData.correctUpdatePost_WITHOUT_blogId,
        blogId: createdBlog.id,
      },
      httpServer,
      HttpStatus.NO_CONTENT,
    );

    const result = await request(httpServer)
      .get(`/posts/${createdPost.id}`)
      .expect(HttpStatus.OK);

    expect(result.body).toEqual({
      ...createdPost,
      ...PostsTestData.correctUpdatePost_WITHOUT_blogId,
      id: createdPost.id.toString(),
      blogId: createdPost.blogId.toString(),
    });
  });
  it('should delete post', async () => {
    await request(httpServer)
      .delete(`/posts/${createdPost.id}`)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(HttpStatus.NO_CONTENT);

    await request(httpServer)
      .get(`/posts/${createdPost.id}`)
      .expect(HttpStatus.NOT_FOUND);
  });
  it('shouldn`t delete unexpected post', async () => {
    await request(httpServer)
      .delete(`/posts/${new ObjectId()}`)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(HttpStatus.NOT_FOUND);

    await request(httpServer)
      .get(`/posts/${new ObjectId()}`)
      .expect(HttpStatus.NOT_FOUND);
  });
});
