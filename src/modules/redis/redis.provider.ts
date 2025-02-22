import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Redis as RedisClient } from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const redisProvider: Provider[] = [
  {
    provide: REDIS_CLIENT,
    inject: [ConfigService],
    useFactory: (configService: ConfigService): RedisClient => {
      const REDIS_URI = configService.get('redisUri');
      return new Redis(REDIS_URI);
    },
  },
];
