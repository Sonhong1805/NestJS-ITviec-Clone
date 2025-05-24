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
        maxRetriesPerRequest: null, // vô hiệu hóa giới hạn retry
        enableReadyCheck: false, // tùy chọn: bỏ kiểm tra 'ready'
        retryStrategy: (times) => {
          if (times >= 10) {
            return null; // ngừng retry sau 10 lần
          }
          return Math.min(times * 100, 3000); // retry sau thời gian tăng dần
        },
      });
    },
  },
];
