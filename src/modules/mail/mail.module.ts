import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { BullModule } from '@nestjs/bullmq';
import { MailProcessor } from './mail.processor';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('mail').host,
          port: configService.get('mail').port,
          auth: {
            user: configService.get('mail').user,
            pass: configService.get('mail').pass,
          },
        },
        defaults: {
          from: configService.get('mail').from,
        },
        template: {
          dir: join(__dirname, '../../assets/mail/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'mail-queue',
    }),
  ],
  controllers: [],
  providers: [MailService, MailProcessor],
  exports: [BullModule],
})
export class MailModule {}
