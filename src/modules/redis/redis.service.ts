import { Inject, Injectable } from '@nestjs/common';
import { Redis as RedisClient } from 'ioredis';
import { REDIS_CLIENT } from './redis.provider';

@Injectable()
export class ResdisService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClient,
  ) {}

  async setKey(key: string, value: string) {
    await this.redisClient.set(key, value, 'EX', 10 * 60);
  }
  async getKey(key: string) {
    return await this.redisClient.get(key);
  }
}
