import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from 'src/modules/users/schemas/users.schema';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleEnum[]) => SetMetadata(ROLES_KEY, roles);
