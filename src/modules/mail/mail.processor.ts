import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from './mail.service';

@Processor('mail-queue')
export class MailProcessor extends WorkerHost {
  constructor(private readonly mailService: MailService) {
    super();
  }
  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'send-mail-applicant') {
      await this.mailService.sendMail(
        job.data.email,
        'welcome to ITviec',
        'welcome-applicant',
        { name: job.data.name, email: job.data.email },
      );
    }

    if (job.name === 'send-mail-company') {
      await this.mailService.sendMail(
        job.data.email,
        'welcome your company to ITviec',
        'welcome-company',
        {
          name: job.data.name,
          email: job.data.email,
          password: job.data.password,
          company: job.data.company,
        },
      );
    }
    if (job.name === 'forgot-password') {
      await this.mailService.sendMail(
        job.data.email,
        `${job.data.email}, reset your password`,
        'forgot-password',
        {
          email: job.data.email,
          path: job.data.path,
        },
      );
    }
    if (job.name === 'change-password') {
      await this.mailService.sendMail(
        job.data.email,
        `${job.data.email}, Your ITviec password has been changed`,
        'change-password',
        {
          username: job.data.username,
          email: job.data.email,
          path: job.data.path,
        },
      );
    }
    if (job.name === 'delete-account') {
      await this.mailService.sendMail(
        job.data.email,
        `Confirm your account deletion for ITviec.com`,
        'delete-account',
        {
          username: job.data.username,
          code: job.data.code,
        },
      );
    }
  }
}
