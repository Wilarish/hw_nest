import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { AppSettings } from '../../app.settings';
import { Paginated } from '../../5-dtos/pagination.types';
import { BlogsMainType } from '../../5-dtos/blog.types';
import { BlogsTestData, BlogsTestManager } from './utils/blogs.test.manager';
import { ObjectId } from 'mongodb';

describe('Blogs_CRUD', () => {
  let app: INestApplication;
  let httpServer;
  const expectedPaginatedResult: Paginated<BlogsMainType> = {
    pagesCount: expect.any(Number),
    page: expect.any(Number),
    pageSize: expect.any(Number),
    totalCount: expect.any(Number),
    items: expect.any(Array),
  };
  let createdBlog: any;
  let createdBlog_2: any;

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
    const res = await request(httpServer).get('/blogs').expect(HttpStatus.OK);
    expect(res.body).toEqual(expectedPaginatedResult);
  });

  it('should create blog with correct data', async () => {
    const response = await BlogsTestManager.createBlog(
      BlogsTestData.correctCreateBlog,
      httpServer,
      HttpStatus.CREATED,
    );
    createdBlog = response.body;
  });
  it('should create blog_2 with correct data', async () => {
    const response = await BlogsTestManager.createBlog(
      BlogsTestData.correctCreateBlog_2,
      httpServer,
      HttpStatus.CREATED,
    );

    createdBlog_2 = response.body;

    const res = await request(httpServer).get('/blogs').expect(HttpStatus.OK);

    expect(res.body).toEqual({ ...expectedPaginatedResult, totalCount: 2 });
    expect(res.body.items).toEqual([createdBlog_2, createdBlog]);
  });
  it('shouldn`t create blog with incorrect data', async () => {
    const result = await BlogsTestManager.createBlog(
      BlogsTestData.incorrectCreateUpdateBlog,
      httpServer,
      HttpStatus.BAD_REQUEST,
    );
    expect(result.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'name',
        },
        {
          message: expect.any(String),
          field: 'description',
        },
        {
          message: expect.any(String),
          field: 'websiteUrl',
        },
      ],
    });
  });
  it('shouldn`t update blog ', async () => {
    const { result } = await BlogsTestManager.updateBlog(
      createdBlog,
      BlogsTestData.incorrectCreateUpdateBlog,
      httpServer,
      HttpStatus.BAD_REQUEST,
    );

    expect(result.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'name',
        },
        {
          message: expect.any(String),
          field: 'description',
        },
        {
          message: expect.any(String),
          field: 'websiteUrl',
        },
      ],
    });

    await request(httpServer)
      .get(`/blogs/${createdBlog.id}`)
      .expect(HttpStatus.OK, createdBlog);
  });
  it('shouldn`t update unexpected blog ', async () => {
    const result = await request(httpServer)
      .put(`/blogs/${-100}`) //ObjectId validator just stopped this
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(BlogsTestData.correctUpdateBlog)
      .expect(HttpStatus.BAD_REQUEST);

    expect(result.body).toEqual({
      errorsMessages: {
        message: 'Invalid Uri Id',
        error: 'Bad Request',
        statusCode: 400,
      },
    });

    await request(httpServer)
      .put(`/blogs/${new ObjectId()}`)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(BlogsTestData.correctUpdateBlog)
      .expect(HttpStatus.NOT_FOUND);
  });
  it('should update blog correct ', async () => {
    const { changeBlog } = await BlogsTestManager.updateBlog(
      createdBlog,
      BlogsTestData.correctUpdateBlog,
      httpServer,
      HttpStatus.NO_CONTENT,
    );
    expect(changeBlog).toEqual({
      ...createdBlog,
      ...BlogsTestData.correctUpdateBlog,
    });
  });
  it('should delete blog', async () => {
    await request(httpServer)
      .delete(`/blogs/${createdBlog.id}`)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(HttpStatus.NO_CONTENT);

    await request(httpServer)
      .get(`/blogs/${createdBlog.id}`)
      .expect(HttpStatus.NOT_FOUND);
  });
  it('shouldn`t delete unexpected blog', async () => {
    await request(httpServer)
      .delete(`/blogs/${new ObjectId()}`)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(HttpStatus.NOT_FOUND);

    await request(httpServer)
      .get(`/blogs/${new ObjectId()}`)
      .expect(HttpStatus.NOT_FOUND);
  });
});
