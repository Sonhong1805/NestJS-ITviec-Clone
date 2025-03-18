import { MailModule } from './modules/mail/mail.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configs/configuration';
import { DatabaseModule } from './databases/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from './ormconfig';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './modules/auth/auth.guard';
import { StorageModule } from './modules/storage/storage.module';
import { SkillModule } from './modules/skill/skill.module';
import { IndustryModule } from './modules/industry/industry.module';
import { CompanyModule } from './modules/company/company.module';
import { RedisModule } from './modules/redis/redis.module';
import { BullModule } from '@nestjs/bullmq';
import { ApplicationModule } from './modules/application/application.module';
import { ApplicantModule } from './modules/applicant/applicant.module';
import { JobModule } from './modules/job/job.module';
import { CompanyRepository } from './databases/repositories/company.repository';
import { SkillRepository } from './databases/repositories/skill.repository';
@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    TypeOrmModule.forRoot(ormConfig),
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt').JWT_ACCESS_TOKEN_SECRET,
      }),
    }),
    MailModule,
    AuthModule,
    StorageModule,
    SkillModule,
    IndustryModule,
    CompanyModule,
    JobModule,
    RedisModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.get('redisUri'),
        },
      }),
    }),
    ApplicationModule,
    ApplicantModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    CompanyRepository,
    SkillRepository,
  ],
})
export class AppModule {}
