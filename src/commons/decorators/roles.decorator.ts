import { SetMetadata } from '@nestjs/common';
import { ROLE } from '../enums/user.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ROLE[]) => SetMetadata(ROLES_KEY, roles);
