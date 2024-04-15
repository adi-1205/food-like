import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { isArray } from 'class-validator';
import { Cart } from 'src/db/models/cart.model';
import { Menu } from 'src/db/models/menu.model';
import { User } from 'src/db/models/user.model';
import { UserStatus } from 'src/shared/enums/status.enum';
import { Stripe } from 'stripe';

import * as dotenv from 'dotenv';
import { CartItem } from 'src/db/models/cartItem.model';
import { Sequelize } from 'sequelize-typescript';
import { where } from 'sequelize';
dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

@Injectable()
export class CustomerService {

    constructor(
        @InjectModel(Menu)
        private readonly MenuModel: typeof Menu,
        @InjectModel(User)
        private readonly UserModel: typeof User,
        @InjectModel(Cart)
        private readonly CartModel: typeof Cart,
        @InjectModel(CartItem)
        private readonly CartItemModel: typeof CartItem,
        @InjectConnection() private seq: Sequelize
    ) {
    }

    async getRestaurants() {
        let _restaurants = await this.UserModel.findAll({
            where: {
                '$menus.accepted$': true,
                status: UserStatus.ACTIVE,
            },
            attributes: ['id', 'restaurant_name'],
            include: {
                model: this.MenuModel,
                attributes: [],
            }
        })

        let restaurants = _restaurants.map(rest => {
            return {
                ...rest.dataValues
            }
        })


        return { restaurants, restaurantPage: true }
    }

    async getRestaurant(id) {
        let _restaurant = await this.UserModel.findOne({
            where: {
                '$menus.accepted$': true,
                status: UserStatus.ACTIVE,
                id: id
            },
            attributes: ['id', 'restaurant_name'],
            include: {
                model: this.MenuModel,
                attributes: ['id', 'name', 'price', 'image', 'description'],
            }
        })

        let restaurant = {
            name: _restaurant.restaurant_name,
            id: _restaurant.id,
            menus: _restaurant.menus.map(menu => {
                return {
                    ...menu.dataValues
                }
            })
        }

        return { restaurant, restaurantPage: true }
    }

    async addToCart(req, items) {

        if (!isArray(items) || items.length === 0)
            throw new BadRequestException('Invalid Items')

        let t = await this.seq.transaction()

        let [cart, created] = await this.CartModel.findOrCreate({
            where: {
                user_id: req.user.id
            },
            defaults: {
                user_id: req.user.id
            }
        })

        for (let item of items) {
            let itemId = parseInt(item.id)
            let itemQty = parseInt(item.qty)
            if (isNaN(itemId) || isNaN(itemQty)) {
                t.rollback()
                throw new BadRequestException('Items and Quanitiy should be numeric string')
            }

            let menuItem = await this.MenuModel.findByPk(itemId)

            if (!menuItem) {
                t.rollback()
                throw new BadRequestException('One or more does not exist on menu')
            }

            let cartItem = await this.CartItemModel.findOne({
                where: {
                    menu_id: itemId,
                    cart_id: cart.id
                }
            })

            if (cartItem) {
                cartItem.qty = itemQty
                await cartItem.save()
            } else {
                await this.CartItemModel.create({
                    menu_id: itemId,
                    cart_id: cart.id,
                    qty: itemQty
                })
            }
        }
        t.commit()
        return { success: true }
    }

    async getCart(req) {
        let cart = await this.CartModel.findOne({
            where: {
                user_id: req.user.id
            }
        })

        if (!cart) return []

        let cartItems = await this.CartItemModel.findAll({
            where: {
                cart_id: cart.id
            },
            attributes: ['qty'],
            include: {
                model: this.MenuModel,
                attributes: ['name', 'image', 'price']
            }
        })

        let allTotal = 0
        let menus = cartItems.map(c => {
            allTotal += c.menu.price * c.qty
            return {
                ...c.menu.toJSON(),
                qty: c.qty,
                total: c.menu.price * c.qty
            }
        })


        return { menus: menus, allTotal, emptyCart: menus.length === 0 }
    }

    async createPaymentSession(req) {

        let cart = await this.CartModel.findOne({
            where: {
                user_id: req.user.id
            }
        })

        if (!cart) return []

        let cartItems = await this.CartItemModel.findAll({
            where: {
                cart_id: cart.id
            },
            attributes: ['qty'],
            include: {
                model: this.MenuModel,
                attributes: ['price', 'name']
            }
        })

        if (cartItems.length == 0)
            throw new BadRequestException('No item in cart to order')

        let menus = cartItems.map(c => {
            return {
                ...c.menu.toJSON(),
                qty: c.qty,
                total: c.menu.price * c.qty
            }
        })


        let line_items = cartItems.map(c => {
            return {
                price_data: {
                    product_data: {
                        name: c.menu.name
                    },
                    currency: 'inr',
                    unit_amount: c.menu.price * 100,
                },
                quantity: c.qty
            }
        })

        console.log('LINE ITEMS');
        console.log(line_items);

        let session = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: line_items,
            success_url: 'http://localhost:3000/success',
            cancel_url: 'http://localhost:3000/fail'
        })

        return { url: session.url }
    }

    async clearCart(req) {
        let cart = await this.CartModel.findOne({
            where: {
                user_id: req.user.id
            }
        })

        await this.CartItemModel.destroy({
            where: {
                cart_id: cart.id
            },
            force: true
        })

        return { url: '/' }
    }
}
