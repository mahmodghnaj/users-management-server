import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  ParseBoolPipe,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { RoleEnum, Users } from './schemas/users.schema';
import { RolesGuard } from './guard/roles.guard';
import { InfinityPaginationResultType } from 'src/utils/types/infinity-pagination-result.type';
import { infinityPagination } from 'src/utils/infinity-pagination';
@UseGuards(RolesGuard)
@Roles(RoleEnum.Admin)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('total', new DefaultValuePipe(false), ParseBoolPipe) total: boolean,
    @Query('sortBy') sortBy: string,
    @Query('sortOrder', new DefaultValuePipe('asc')) sortOrder: 'asc' | 'desc',
    @Query('name') name: string,
  ): Promise<InfinityPaginationResultType<Users>> {
    if (limit > 50) {
      limit = 50;
    }
    return infinityPagination(
      await this.usersService.findManyWithPagination(
        {
          page,
          limit,
          total,
          sortBy,
          sortOrder,
        },
        name,
      ),
      { page, limit, total },
    );
  }
}
