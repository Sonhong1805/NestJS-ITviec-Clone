import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FileOptions } from '@supabase/storage-js';

@Injectable()
export class StorageService {
  private client: SupabaseClient;
  private bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.client = createClient(
      this.configService.get('supabase').url,
      this.configService.get('supabase').key,
    );
    this.bucket = this.configService.get('supabase').bucket;
  }
  async uploadFile(key: string, file: Buffer, options: FileOptions = {}) {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .upload(key, file, {
        ...options,
      });
    if (error) {
      throw new Error('GetSignedUrl error: ' + error.message);
    }
    return {
      path: data.path,
    };
  }

  async getSignedUrl(key: string, expireIn = 600) {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUrl(key, expireIn);
    if (error) {
      throw new Error('GetSignedUrl error: ' + error.message);
    }
    return data.signedUrl;
  }

  async deleteFile(key: string) {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .remove([key]);
    if (error) {
      throw new Error('delete failed: ' + error.message);
    }

    return data;
  }
}
