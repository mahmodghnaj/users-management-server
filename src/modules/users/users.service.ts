import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NullableType } from 'src/utils/types/nullable.type';
import { CreateUserDto } from './dto/create-user.dto';
import { Users, UsersDocument } from './schemas/users.schema';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { DatePagination } from 'src/utils/infinity-pagination';

@Injectable()
export class UsersService {
  constructor(@InjectModel('Users') private usersModel: Model<Users>) {}

  async createUser(createUser: CreateUserDto): Promise<UsersDocument> {
    const createdUser = new this.usersModel(createUser);
    return await createdUser.save();
  }

  async validateUser(
    payload: EntityCondition<UsersDocument>,
  ): Promise<NullableType<UsersDocument>> {
    return await this.usersModel
      .findOne({
        ...payload,
      })
      .select('+password')
      .select('+refreshToken')
      .select('+hash')
      .exec();
  }
  async findOne(
    fields: EntityCondition<UsersDocument>,
  ): Promise<NullableType<UsersDocument>> {
    return await this.usersModel.findOne({
      ...fields,
    });
  }
  async update(
    id: UsersDocument['id'],
    payload: EntityCondition<UsersDocument>,
  ): Promise<Users> {
    const user = await this.usersModel.findByIdAndUpdate(
      id,
      { ...payload },
      {
        new: true,
      },
    );

    return user;
  }
  findManyWithPagination(
    paginationOptions: IPaginationOptions,
    name: string,
  ): Promise<DatePagination<Users>> {
    const { page, limit, sortBy, sortOrder, total } = paginationOptions;
    const sortCriteria = {};
    if (sortBy) {
      sortCriteria[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }
    const nameRegex = new RegExp(name, 'i');
    const findQuery = this.usersModel
      .find({
        $or: [
          { firstName: { $regex: nameRegex } },
          { lastName: { $regex: nameRegex } },
        ],
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sortCriteria)
      .exec();

    if (total) {
      const countQuery = this.usersModel.countDocuments({
        $or: [
          { firstName: { $regex: nameRegex } },
          { lastName: { $regex: nameRegex } },
        ],
      });
      return Promise.all([findQuery, countQuery]).then(([data, totalCount]) => {
        return { data, total: totalCount };
      });
    }

    return findQuery.then((data) => ({ data }));
  }
}
