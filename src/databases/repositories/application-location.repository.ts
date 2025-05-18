import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationLocation } from '../entities/application-location.entity';

export class ApplicationLocationRepository extends Repository<ApplicationLocation> {
  constructor(
    @InjectRepository(ApplicationLocation)
    private readonly applicationLocationRepository: Repository<ApplicationLocation>,
  ) {
    super(
      applicationLocationRepository.target,
      applicationLocationRepository.manager,
      applicationLocationRepository.queryRunner,
    );
  }
}
