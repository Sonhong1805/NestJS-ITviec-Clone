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
        },
      );
    }
  }
}
