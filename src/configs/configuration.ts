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
  supabase: {
    key: process.env.SUPABASE_KEY || '',
    url: process.env.SUPABASE_URL || '',
    bucket: process.env.SUPABASE_PRIVATE_BUCKET || '',
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
