import request from 'supertest';
import { HttpStatus } from '@nestjs/common';

export const PostsTestManager = {
  async createPost(data: any, httpServer: any, status: HttpStatus) {
    const result = await request(httpServer)
      .post('/posts')
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(data)
      .expect(status);

    if (status === HttpStatus.CREATED) {
      await request(httpServer)
        .get(`/posts/${result.body.id}`)
        .expect(HttpStatus.OK, result.body);
    }
    return result;
  },
  async updatePost(post: any, data: any, httpServer: any, status: HttpStatus) {
    const result = await request(httpServer)
      .put(`/posts/${post.id}`)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(data)
      .expect(status);

    let changePost;

    if (status === HttpStatus.NO_CONTENT) {
      changePost = await request(httpServer)
        .get(`/posts/${post.id}`)
        .expect(HttpStatus.OK);

      expect(changePost.body).toEqual({
        id: post.id,
        title: data.title,
        shortDescription: data.shortDescription,
        content: data.content,
        blogId: data.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: expect.any(Object),
      });
    }
    return { changePost: changePost?.body, result };
  },
  async ratePost(
    data: {
      token: string;
      postId: string;
      likeStatus: string;
    },
    httpServer: any,
    status: HttpStatus,
  ) {
    const result = await request(httpServer)
      .put(`/posts/${data.postId}/like-status`)
      .set('Authorization', `Bearer ${data.token}`)
      .send({ likeStatus: data.likeStatus })
      .expect(status);

    if (status === HttpStatus.NO_CONTENT) {
      const result = await request(httpServer)
        .get(`/posts/${data.postId}`)
        .set('Authorization', `Bearer ${data.token}`);

      expect(result.body?.extendedLikesInfo.myStatus).toBe(data.likeStatus);
      return;
    }
    return result;
  },
};
export const PostsTestData = {
  correctCreatePost_WITHOUT_blogId: {
    title: 'string',
    shortDescription: 'string',
    content: 'string',
  },
  correctCreatePost_2_WITHOUT_blogId: {
    title: 'string2',
    shortDescription: 'string2',
    content: 'string2',
  },
  correctUpdatePost_WITHOUT_blogId: {
    title: 'change',
    shortDescription: 'change',
    content: 'change',
  },
  incorrectCreateUpdatePost: {
    title: 123,
    shortDescription: 123,
    content: 123,
    blogId: '123456123456123456123456',
  },
};
