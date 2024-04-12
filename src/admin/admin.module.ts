import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthModule } from 'src/auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/db/models/user.model';
import { MailModule } from 'src/mail/mail.module';
import { Menu } from 'src/db/models/menu.model';

@Module({
  imports: [AuthModule,
    SequelizeModule.forFeature([User,Menu]),
    MailModule
  ],
  providers: [AdminService],
  controllers: [AdminController]
})
export class AdminModule { }
