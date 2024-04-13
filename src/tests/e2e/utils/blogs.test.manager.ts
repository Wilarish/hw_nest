import request from 'supertest';
import { HttpStatus } from '@nestjs/common';

export const BlogsTestManager = {
  async createBlog(data: any, httpServer: any, status: HttpStatus) {
    const result = await request(httpServer)
      .post('/blogs')
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(data)
      .expect(status);

    if (status === HttpStatus.CREATED) {
      await request(httpServer)
        .get(`/blogs/${result.body.id}`)
        .expect(HttpStatus.OK, result.body);
    }
    return result;
  },
  async updateBlog(blog: any, data: any, httpServer: any, status: HttpStatus) {
    const result = await request(httpServer)
      .put(`/blogs/${blog.id}`)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(data)
      .expect(status);

    let changeBlog;

    if (status === HttpStatus.NO_CONTENT) {
      changeBlog = await request(httpServer)
        .get(`/blogs/${blog.id}`)
        .expect(HttpStatus.OK);

      expect(changeBlog.body).toEqual({
        id: blog.id,
        name: data.name,
        description: data.description,
        websiteUrl: data.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership,
      });
    }
    return { changeBlog: changeBlog?.body, result };
  },
};
export const BlogsTestData = {
  correctCreateBlog: {
    name: 'string',
    description: 'string',
    websiteUrl: 'https://www.google.com',
  },
  correctCreateBlog_2: {
    name: 'string2',
    description: 'string2',
    websiteUrl: 'https://www.google2.com',
  },
  correctUpdateBlog: {
    name: 'change',
    description: 'change',
    websiteUrl: 'https://change.com',
  },
  incorrectCreateUpdateBlog: {
    name: 123,
    description: 123,
    websiteUrl: 123,
  },
};
