import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/db/models/user.model';
import { Menu } from 'src/db/models/menu.model';
import { Cart } from 'src/db/models/cart.model';
import { CartItem } from 'src/db/models/cartItem.model';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Menu, Cart, CartItem])
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule { }
