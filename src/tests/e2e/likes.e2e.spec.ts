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
import { likeStatuses } from '../../5-dtos/likes.types';
import { ObjectId } from 'mongodb';

describe('likes', () => {
  let app;
  let httpServer;
  let createdBlog;
  let createdPost;
  let createdComment;
  let token_User: string;
  let token_User2: string;
  let token_User3: string;
  let token_User4: string;

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

  describe('like-comments', () => {
    beforeAll(async () => {
      await request(httpServer)
        .delete('/testing/all-data')
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should create 4 users and login all', async () => {
      await UsersTestManager.createUser(
        UsersTestData.correctCreateUser,
        httpServer,
        HttpStatus.CREATED,
      );
      await UsersTestManager.createUser(
        UsersTestData.correctCreateUser_2,
        httpServer,
        HttpStatus.CREATED,
      );
      await UsersTestManager.createUser(
        UsersTestData.correctCreateUser_3,
        httpServer,
        HttpStatus.CREATED,
      );
      await UsersTestManager.createUser(
        UsersTestData.correctCreateUser_4,
        httpServer,
        HttpStatus.CREATED,
      );

      const result = await UsersTestManager.loginUser(
        UsersTestData.loginCreateUser,
        httpServer,
        HttpStatus.OK,
      );
      const result_2 = await UsersTestManager.loginUser(
        UsersTestData.loginCreateUser_2,
        httpServer,
        HttpStatus.OK,
      );
      const result_3 = await UsersTestManager.loginUser(
        UsersTestData.loginCreateUser_3,
        httpServer,
        HttpStatus.OK,
      );
      const result_4 = await UsersTestManager.loginUser(
        UsersTestData.loginCreateUser_4,
        httpServer,
        HttpStatus.OK,
      );

      token_User = result.accessToken;
      token_User2 = result_2.accessToken;
      token_User3 = result_3.accessToken;
      token_User4 = result_4.accessToken;

      //createdUser = response.body;
    }, 10000);
    it('should create post and comment', async () => {
      createdBlog = await BlogsTestManager.createBlog(
        BlogsTestData.correctCreateBlog,
        httpServer,
        HttpStatus.CREATED,
      );

      const result_post = await PostsTestManager.createPost(
        {
          ...PostsTestData.correctCreatePost_WITHOUT_blogId,
          blogId: createdBlog.body.id,
        },
        httpServer,
        HttpStatus.CREATED,
      );

      const result_comment = await CommentsTestManager.createComment(
        {
          postId: result_post.body.id,
          accessToken: token_User,
          create: CommentsTestData.correctCreateComment,
        },
        httpServer,
        HttpStatus.CREATED,
      );

      createdPost = result_post.body;
      createdComment = result_comment.body;
    });
    it('shouldn`t like comment (wrong data)', async () => {
      await CommentsTestManager.rateComment(
        {
          token: token_User,
          commentId: createdComment.id,
          likeStatus: 'Likeeeeee',
        },
        httpServer,
        HttpStatus.BAD_REQUEST,
      );

      await CommentsTestManager.rateComment(
        {
          token: token_User + 'eeeee',
          commentId: createdComment.id,
          likeStatus: likeStatuses.Like,
        },
        httpServer,
        HttpStatus.UNAUTHORIZED,
      );

      await CommentsTestManager.rateComment(
        {
          token: token_User,
          commentId: new ObjectId().toString(),
          likeStatus: likeStatuses.Like,
        },
        httpServer,
        HttpStatus.NOT_FOUND,
      );
    });
    it('should like comment', async () => {
      await CommentsTestManager.rateComment(
        {
          token: token_User,
          commentId: createdComment.id,
          likeStatus: likeStatuses.Like,
        },
        httpServer,
        HttpStatus.NO_CONTENT,
      );
      await CommentsTestManager.rateComment(
        {
          token: token_User,
          commentId: createdComment.id,
          likeStatus: likeStatuses.Like,
        },
        httpServer,
        HttpStatus.NO_CONTENT,
      );

      await CommentsTestManager.rateComment(
        {
          token: token_User2,
          commentId: createdComment.id,
          likeStatus: likeStatuses.Like,
        },
        httpServer,
        HttpStatus.NO_CONTENT,
      );

      await CommentsTestManager.rateComment(
        {
          token: token_User3,
          commentId: createdComment.id,
          likeStatus: likeStatuses.Like,
        },
        httpServer,
        HttpStatus.NO_CONTENT,
      );

      const result = await request(httpServer)
        .get(`/comments/${createdComment.id}`)
        .set('Authorization', `Bearer ${token_User}`);

      expect(result.body.id).toEqual(createdComment.id);
      expect(result.body?.likesInfo.likesCount).toEqual(3);
      expect(result.body.likesInfo.dislikesCount).toEqual(0);
      expect(result.body?.likesInfo.myStatus).toBe(likeStatuses.Like);
    }, 15000);
    it('should change likes to dislikes', async () => {
      await CommentsTestManager.rateComment(
        {
          token: token_User2,
          commentId: createdComment.id,
          likeStatus: likeStatuses.Dislike,
        },
        httpServer,
        HttpStatus.NO_CONTENT,
      );

      await CommentsTestManager.rateComment(
        {
          token: token_User3,
          commentId: createdComment.id,
          likeStatus: likeStatuses.Dislike,
        },
        httpServer,
        HttpStatus.NO_CONTENT,
      );

      const result = await request(httpServer)
        .get(`/comments/${createdComment.id}`)
        .set('Authorization', `Bearer ${token_User}`);

      expect(result.body.id).toEqual(createdComment.id);
      expect(result.body.likesInfo.dislikesCount).toEqual(2);
      expect(result.body.likesInfo.likesCount).toEqual(1);
      expect(result.body?.likesInfo.myStatus).toBe(likeStatuses.Like);
    }, 20000);
    it('should return comments for post', async () => {
      const result = await request(httpServer)
        .get(`/posts/${createdPost.id}/comments`)
        .set('Authorization', `Bearer ${token_User3}`);

      expect(result.body.items.length).toBe(1);
      expect(result.body.items[0].id).toEqual(createdComment.id);
      expect(result.body.items[0].likesInfo.myStatus).toBe(
        likeStatuses.Dislike,
      );
    });
  });
  describe('posts-likes', () => {
    beforeAll(async () => {
      await request(httpServer)
        .delete('/testing/all-data')
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should create 4 users and login all', async () => {
      await UsersTestManager.createUser(
        UsersTestData.correctCreateUser,
        httpServer,
        HttpStatus.CREATED,
      );
      await UsersTestManager.createUser(
        UsersTestData.correctCreateUser_2,
        httpServer,
        HttpStatus.CREATED,
      );
      await UsersTestManager.createUser(
        UsersTestData.correctCreateUser_3,
        httpServer,
        HttpStatus.CREATED,
      );
      await UsersTestManager.createUser(
        UsersTestData.correctCreateUser_4,
        httpServer,
        HttpStatus.CREATED,
      );

      const result = await UsersTestManager.loginUser(
        UsersTestData.loginCreateUser,
        httpServer,
        HttpStatus.OK,
      );
      const result_2 = await UsersTestManager.loginUser(
        UsersTestData.loginCreateUser_2,
        httpServer,
        HttpStatus.OK,
      );
      const result_3 = await UsersTestManager.loginUser(
        UsersTestData.loginCreateUser_3,
        httpServer,
        HttpStatus.OK,
      );
      const result_4 = await UsersTestManager.loginUser(
        UsersTestData.loginCreateUser_4,
        httpServer,
        HttpStatus.OK,
      );

      token_User = result.accessToken;
      token_User2 = result_2.accessToken;
      token_User3 = result_3.accessToken;
      token_User4 = result_4.accessToken;

      //createdUser = response.body;
    }, 10000);
    it('should create post', async () => {
      createdBlog = await BlogsTestManager.createBlog(
        BlogsTestData.correctCreateBlog,
        httpServer,
        HttpStatus.CREATED,
      );

      const result_post = await PostsTestManager.createPost(
        {
          ...PostsTestData.correctCreatePost_WITHOUT_blogId,
          blogId: createdBlog.body.id,
        },
        httpServer,
        HttpStatus.CREATED,
      );

      createdPost = result_post.body;
    });
    it('shouldn`t like post ', async () => {
      await PostsTestManager.ratePost(
        {
          token: token_User + 'q121212',
          postId: createdPost.id,
          likeStatus: likeStatuses.Like,
        },
        httpServer,
        HttpStatus.UNAUTHORIZED,
      );
      await PostsTestManager.ratePost(
        {
          token: token_User,
          postId: new ObjectId().toString(),
          likeStatus: likeStatuses.Like,
        },
        httpServer,
        HttpStatus.NOT_FOUND,
      );
      await PostsTestManager.ratePost(
        {
          token: token_User,
          postId: createdPost.id,
          likeStatus: 'Likeeeesss',
        },
        httpServer,
        HttpStatus.BAD_REQUEST,
      );
    });
    it('should like post', async () => {
      await PostsTestManager.ratePost(
        {
          token: token_User,
          postId: createdPost.id,
          likeStatus: likeStatuses.Like,
        },
        httpServer,
        HttpStatus.NO_CONTENT,
      );

      await PostsTestManager.ratePost(
        {
          token: token_User2,
          postId: createdPost.id,
          likeStatus: likeStatuses.Like,
        },
        httpServer,
        HttpStatus.NO_CONTENT,
      );

      const result = await request(httpServer)
        .get(`/posts/${createdPost.id}`)
        .set('Authorization', `Bearer ${token_User}`);

      expect(result.body.extendedLikesInfo.newestLikes.length).toEqual(2);
      expect(result.body.extendedLikesInfo.likesCount).toEqual(2);
      expect(result.body.extendedLikesInfo.dislikesCount).toEqual(0);
      expect(result.body.extendedLikesInfo.myStatus).toEqual(likeStatuses.Like);
    });
    it('should dislike post and check newestLikes', async () => {
      await PostsTestManager.ratePost(
        {
          token: token_User3,
          postId: createdPost.id,
          likeStatus: likeStatuses.Like,
        },
        httpServer,
        HttpStatus.NO_CONTENT,
      );

      await PostsTestManager.ratePost(
        {
          token: token_User4,
          postId: createdPost.id,
          likeStatus: likeStatuses.Dislike,
        },
        httpServer,
        HttpStatus.NO_CONTENT,
      );

      const result = await request(httpServer)
        .get(`/posts/${createdPost.id}`)
        .set('Authorization', `Bearer ${token_User3}`);

      expect(result.body.extendedLikesInfo.newestLikes.length).toEqual(3);
      expect(result.body.extendedLikesInfo.likesCount).toEqual(3);
      expect(result.body.extendedLikesInfo.dislikesCount).toEqual(1);

      expect(result.body.extendedLikesInfo.newestLikes[0].login).toEqual(
        UsersTestData.correctCreateUser_3.login,
      );
      expect(result.body.extendedLikesInfo.newestLikes[1].login).toEqual(
        UsersTestData.correctCreateUser_2.login,
      );
      expect(result.body.extendedLikesInfo.newestLikes[2].login).toEqual(
        UsersTestData.correctCreateUser.login,
      );
    }, 15000);
    it('should return post for blog', async () => {
      const result = await request(httpServer)
        .get(`/blogs/${createdBlog.body.id}/posts`)
        .set('Authorization', `Bearer ${token_User4}`);

      expect(result.body.items.length).toBe(1);
      expect(result.body.items[0].extendedLikesInfo.newestLikes.length).toBe(3);
    });
  });
});
