import { Body, Controller, Get, Param, Post, Render, Req, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller()
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  @Get('restaurants')
  // @Roles(Role.CUSTOMER)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Render('customer/restaurants')
  async getViewRestaurants() {
    return await this.customerService.getRestaurants()
  }

  @Get('restaurants/:id')
  // @Roles(Role.USER)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Render('customer/restaurant')
  async getRestaurant(@Param('id') id) {
    return await this.customerService.getRestaurant(id)
  }

  @Post('cart')
  @Roles(Role.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async addToCart(@Req() req, @Body('ids') ids) {
    return await this.customerService.addToCart(req, ids)
  }
}
