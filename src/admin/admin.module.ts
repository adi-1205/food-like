import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthModule } from 'src/auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/db/models/user.model';
import { MailModule } from 'src/mail/mail.module';
import { Menu } from 'src/db/models/menu.model';
import { Cart } from 'src/db/models/cart.model';
import { CartItem } from 'src/db/models/cartItem.model';
import { JwtModule, JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [AuthModule,
    SequelizeModule.forFeature([User, Menu, Cart, CartItem]),
    MailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET
    }),
  ],
  providers: [AdminService],
  controllers: [AdminController]
})
export class AdminModule { }
