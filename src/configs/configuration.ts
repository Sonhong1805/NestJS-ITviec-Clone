import { Logger } from '@nestjs/common';

export const REQUIRED_ENVS = [
  'DATABASE_HOST',
  'DATABASE_PORT',
  'DATABASE_USERNAME',
  'DATABASE_PASSWORD',
  'DATABASE_NAME',
];

export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  jwtAuth: {
    jwtAccessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
    jwtRefreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
  },
  supabase: {
    key: process.env.SUPABASE_KEY || '',
    url: process.env.SUPABASE_URL || '',
    bucket: process.env.SUPABASE_PRIVATE_BUCKET || '',
  },
  google: {
    clientId: process.env.GG_CLIENT_ID || '',
    clientSecret: process.env.GG_CLIENT_SECRET || '',
  },
  mail: {
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
    from: process.env.MAIL_FROM || '',
    host: process.env.MAIL_HOST || '',
    port: process.env.MAIL_PORT || '',
  },
});

export const validateEnvironments = (): void => {
  if (process.env.NODE_ENV === undefined) {
    process.env.NODE_ENV = 'development';
  }
  Logger.log(`Check require env variable: START!`);
  REQUIRED_ENVS.forEach((v) => {
    if (!process.env[v]) throw Error(`Missing required env variable ${v}`);
  });
  Logger.log(`Check require env variable: DONE!`);
};
