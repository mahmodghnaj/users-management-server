import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersSchema } from './schemas/users.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MailerModule } from '../mailer/mailer.module';
import { AuthModule } from '../auth/auth.module';
import { UsersGateway } from './users.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ schema: UsersSchema, name: 'Users' }]),
    MailerModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersGateway],
  exports: [UsersService, UsersGateway],
})
export class UsersModule {}
