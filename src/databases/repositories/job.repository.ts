import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../entities/job.entity';

export class JobRepository extends Repository<Job> {
  constructor(
    @InjectRepository(Job)
    private readonly JobRepository: Repository<Job>,
  ) {
    super(
      JobRepository.target,
      JobRepository.manager,
      JobRepository.queryRunner,
    );
  }
}
