import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from './mail.service';

@Processor('mail-queue')
export class MailProcessor extends WorkerHost {
  constructor(private readonly mailService: MailService) {
    super();
  }
  async process(mail: Job<any, any, string>): Promise<any> {
    if (mail.name === 'register-applicant') {
      await this.mailService.sendMail(
        mail.data.email,
        `Chào mừng ${mail.data.name} thuy đến với ITviec! Bước tiếp theo là...`,
        'register-applicant',
        { name: mail.data.name, email: mail.data.email },
      );
    }

    if (mail.name === 'register-company') {
      await this.mailService.sendMail(
        mail.data.email,
        `Welcome ${mail.data.name} to ITviec! The next step is...`,
        'register-company',
        {
          name: mail.data.name,
          email: mail.data.email,
          password: mail.data.password,
          company: mail.data.company,
        },
      );
    }
    if (mail.name === 'forgot-password') {
      await this.mailService.sendMail(
        mail.data.email,
        `${mail.data.email}, reset your password`,
        'forgot-password',
        {
          email: mail.data.email,
          path: mail.data.path,
        },
      );
    }
    if (mail.name === 'change-password') {
      await this.mailService.sendMail(
        mail.data.email,
        `${mail.data.email}, Your ITviec password has been changed`,
        'change-password',
        {
          username: mail.data.username,
          email: mail.data.email,
          path: mail.data.path,
        },
      );
    }
    if (mail.name === 'delete-account') {
      await this.mailService.sendMail(
        mail.data.email,
        `Confirm your account deletion for ITviec.com`,
        'delete-account',
        {
          username: mail.data.username,
          code: mail.data.code,
        },
      );
    }
    if (mail.name === 'application-success') {
      await this.mailService.sendMail(
        mail.data.email,
        `We received your CV for ${mail.data.job} at ${mail.data.company}`,
        'application-success',
        {
          username: mail.data.username,
          job: mail.data.job,
          company: mail.data.company,
        },
      );
    }
    if (mail.name === 'cv-accepted') {
      await this.mailService.sendMail(
        mail.data.email,
        `Cập nhật tình trạng hồ sơ của bạn cho vị trí ${mail.data.job} tại ${mail.data.company}`,
        'cv-accepted',
        {
          username: mail.data.username,
          job: mail.data.job,
          company: mail.data.company,
        },
      );
    }
    if (mail.name === 'cv-reject') {
      await this.mailService.sendMail(
        mail.data.email,
        `Cập nhật tình trạng hồ sơ của bạn cho vị trí ${mail.data.job} tại ${mail.data.company}`,
        'cv-reject',
        {
          username: mail.data.username,
          job: mail.data.job,
          company: mail.data.company,
        },
      );
    }
  }
}
