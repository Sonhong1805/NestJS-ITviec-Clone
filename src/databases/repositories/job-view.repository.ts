import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobView } from '../entities/job-view.entity';

export class JobViewRepository extends Repository<JobView> {
  constructor(
    @InjectRepository(JobView)
    private readonly JobViewRepository: Repository<JobView>,
  ) {
    super(
      JobViewRepository.target,
      JobViewRepository.manager,
      JobViewRepository.queryRunner,
    );
  }
}
