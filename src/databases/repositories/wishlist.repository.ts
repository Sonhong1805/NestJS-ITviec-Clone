import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from '../entities/wishlist.entity';

export class WishlistRepository extends Repository<Wishlist> {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
  ) {
    super(
      wishlistRepository.target,
      wishlistRepository.manager,
      wishlistRepository.queryRunner,
    );
  }
}
