import { Body, Controller, Get, Param, Post, Redirect, Render, Req, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller()
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  @Get()
  @Render('customer/restaurants')
  async getViewRestaurants() {
    return await this.customerService.getRestaurants()
  }

  @Get('cart')
  @Render('customer/cart')
  @Roles(Role.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getViewCart(@Req() req) {
    return await this.customerService.getCart(req)
  }

  @Get('order')
  @Roles(Role.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createPaymentSession(@Req() req) {
    return await this.customerService.createPaymentSession(req)
  }

  @Get('success')
  @Redirect()
  @Roles(Role.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async success(@Req() req) {
    return await this.customerService.clearCart(req)
  }

  @Get('fail')

  fail() {
    return 'fail'
  }

  @Get('restaurants/:id')
  @Render('customer/restaurant')
  async getRestaurant(@Param('id') id) {
    return await this.customerService.getRestaurant(id)
  }

  @Post('cart')
  @Roles(Role.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async addToCart(@Req() req, @Body('items') items) {
    return await this.customerService.addToCart(req, items)
  }
}
