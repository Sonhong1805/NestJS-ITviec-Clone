import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobSave } from '../entities/job-save.entity';

export class JobSaveRepository extends Repository<JobSave> {
  constructor(
    @InjectRepository(JobSave)
    private readonly jobSaveRepository: Repository<JobSave>,
  ) {
    super(
      jobSaveRepository.target,
      jobSaveRepository.manager,
      jobSaveRepository.queryRunner,
    );
  }
}
