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
      return new Redis(REDIS_URI, {
        maxRetriesPerRequest: null, // Cho phép các lệnh chờ vô thời hạn khi Redis không phản hồi
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 100, 3000); // Tăng dần thời gian chờ, tối đa 3 giây
          return delay;
        },
      });
    },
  },
];
