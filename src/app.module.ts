import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DbModule } from './db/db.module';
import { CustomerModule } from './customer/customer.module';

@Module({
  imports: [
    AdminModule,
    AuthModule,
    UserModule,
    DbModule,
    CustomerModule
  ],

})
export class AppModule { }
