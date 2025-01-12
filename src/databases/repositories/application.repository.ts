import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../entities/application.entity';

export class ApplicationRepository extends Repository<Application> {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {
    super(
      applicationRepository.target,
      applicationRepository.manager,
      applicationRepository.queryRunner,
    );
  }
}
