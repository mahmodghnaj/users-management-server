import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UsersDocument = HydratedDocument<Users>;

export enum StatusEnum {
  'active' = 1,
  'inactive' = 2,
}
export enum connectionStatusEnum {
  'online' = 1,
  'offline' = 2,
}
export enum RoleEnum {
  'Admin' = 'admin',
  'User' = 'user',
}
@Schema({ timestamps: true })
export class Users {
  @Prop({ required: true })
  firstName: string;
  @Prop({})
  lastName: string;
  @Prop({ unique: true })
  email: string;
  @Prop({ select: false })
  password: string;
  @Prop({ select: false })
  refreshToken: string[];
  @Prop({ enum: StatusEnum, default: 2 })
  status: StatusEnum;
  @Prop({ select: false })
  hash: string;
  @Prop({ type: Date })
  lastPasswordChange: Date;
  @Prop({})
  socialId: string;
  @Prop({})
  socialType: string;
  @Prop({})
  roles: RoleEnum[];
  @Prop({ enum: connectionStatusEnum, default: 2 })
  connectionStatus: connectionStatusEnum;
  @Prop({ type: Date })
  lastSeenAt: Date | null;
}
export const UsersSchema = SchemaFactory.createForClass(Users);

UsersSchema.pre('save', async function (next) {
  const user = this as Users;
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    user.password = hashedPassword;
    next();
  } catch (err) {
    return next(err);
  }
});

UsersSchema.pre('findOneAndUpdate', async function (next) {
  const update: any = this.getUpdate();

  if (!update.password) {
    return next();
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(update.password, saltRounds);
    update.password = hashedPassword;
    next();
  } catch (err) {
    return next(err);
  }
});
