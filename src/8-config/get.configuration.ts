import * as process from 'node:process';

export const getConfiguration = () => ({
  MONGO_URL: process.env.MONGO_URL ?? 'mongodb://0.0.0.0:27017/Posts_Blogs_HW2',
  SECRET_JWT: process.env.SECRET_JWT ?? '112233',
  ADMIN_LOGIN_PASSWORD: process.env.ADMIN_LOGIN_PASSWORD ?? 'none',
});
export type ConfigType = ReturnType<typeof getConfiguration>;
