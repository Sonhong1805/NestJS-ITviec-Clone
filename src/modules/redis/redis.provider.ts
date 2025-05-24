import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Redis as RedisClient } from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const redisProvider: Provider[] = [
  {
    provide: REDIS_CLIENT,
    inject: [ConfigService],
    useFactory: (configService: ConfigService): RedisClient => {
      const redisUri = configService.get<string>('REDIS_URI');

      const client = new Redis(redisUri, {
        tls: {},
        maxRetriesPerRequest: null,
        enableReadyCheck: true,
      });

      client.on('connect', () => {
        console.log('✅ Connected to Upstash Redis');
      });

      client.on('error', (err) => {
        console.error('❌ Redis connection error:', err);
      });

      return client;
    },
  },
];
