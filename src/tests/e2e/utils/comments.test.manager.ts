import { HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { CommentsCreateUpdateValidate } from '../../../7-config/validation-pipes/comments.pipes';
import { ObjectId } from 'mongodb';

export const CommentsTestManager = {
  async createComment(
    data: {
      postId: string;
      accessToken: string;
      create: CommentsCreateUpdateValidate;
    },
    httpServer: any,
    status: HttpStatus,
  ) {
    const result = await request(httpServer)
      .post(`/posts/${data.postId}/comments`)
      .set('Authorization', `Bearer ${data.accessToken}`)
      .send(data.create)
      .expect(status);

    if (status === HttpStatus.CREATED) {
      await request(httpServer)
        .get(`/comments/${result.body.id}`)
        .expect(HttpStatus.OK, result.body);
    }
    return result;
  },
  async updateComment(
    data: {
      commentId: string;
      token: string;
      content: CommentsCreateUpdateValidate | any;
    },
    httpServer: any,
    status: HttpStatus,
  ) {
    const result = await request(httpServer)
      .put(`/comments/${data.commentId}`)
      .set('Authorization', `Bearer ${data.token}`)
      .send(data.content)
      .expect(status);

    let changeComment;

    if (status === HttpStatus.NO_CONTENT) {
      changeComment = await request(httpServer)
        .get(`/comments/${data.commentId}`)
        .expect(HttpStatus.OK);

      expect(changeComment.body).toEqual({
        id: new ObjectId(data.commentId).toString(),
        content: data.content.content,
        commentatorInfo: expect.any(Object),
        createdAt: expect.any(String),
        likesInfo: expect.any(Object),
      });
    }
    return { changeComment: changeComment?.body, result };
  },
  async rateComment(
    data: {
      token: string;
      commentId: string;
      likeStatus: string;
    },
    httpServer: any,
    status: HttpStatus,
  ) {
    const result = await request(httpServer)
      .put(`/comments/${data.commentId}/like-status`)
      .set('Authorization', `Bearer ${data.token}`)
      .send({ likeStatus: data.likeStatus })
      .expect(status);

    if (status === HttpStatus.NO_CONTENT) {
      const result = await request(httpServer)
        .get(`/comments/${data.commentId}`)
        .set('Authorization', `Bearer ${data.token}`);

      expect(result.body?.likesInfo.myStatus).toBe(data.likeStatus);
      return;
    }
    return result;
  },
};
export const CommentsTestData = {
  correctCreateComment: {
    content: 'qwertyqwertyqwertyqwertyqwertyqwertyqwerty',
  },
  incorrectCreateUpdateComment: {
    content: 123,
  },
  correctUpdateComment: {
    content: 'asdfsdfasdfasdfasdfasdfasdfasdfasdfasdf',
  },
};
