import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { isArray } from 'class-validator';
import { Cart } from 'src/db/models/cart.model';
import { Menu } from 'src/db/models/menu.model';
import { User } from 'src/db/models/user.model';
import { UserStatus } from 'src/shared/enums/status.enum';

@Injectable()
export class CustomerService {

    constructor(
        @InjectModel(Menu)
        private readonly MenuModel: typeof Menu,
        @InjectModel(User)
        private readonly UserModel: typeof User,
        @InjectModel(Cart)
        private readonly CartModel: typeof Cart,
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

        console.log(restaurants);

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

        console.log(restaurant);

        return { restaurant, restaurantPage: true }
    }

    async addToCart(req, ids) {
        console.log(ids);

        if (!isArray(ids) || ids.length === 0)
            throw new BadRequestException('Invalid Items')
        for (let id of ids)
            if (isNaN(+id))
                throw new BadRequestException('Invalid Item')

        const menus = await this.MenuModel.findAll({
            where: {
                id: ids,
            },
            raw: true
        });

        if (menus.length !== ids.length) {
            throw new BadRequestException('One or more menu items not found');
        }

        const cartItems = menus.map(menu => ({
            user_id: req.user.id,
            menu_id: menu.id
        }));

        await this.CartModel.bulkCreate(cartItems);

        return { success: true }
    }
}
