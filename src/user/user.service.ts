import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMenu } from './dto/create-menu.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Menu } from 'src/db/models/menu.model';
import { User } from 'src/db/models/user.model';
import { UserStatus } from 'src/shared/enums/status.enum';
import { Role } from 'src/shared/enums/role.enum';

@Injectable()
export class UserService {

    constructor(
        @InjectModel(Menu)
        private readonly MenuModel: typeof Menu,
        @InjectModel(User)
        private readonly UserModel: typeof User,
    ) {
    }

    async createMenu(req, file, menu: CreateMenu) {
        await this.MenuModel.create({
            name: menu.name,
            price: menu.price,
            image: file.filename,
            description: menu.desc,
            user_id: req.user.id
        })
        return { success: true }
    }

    async getFullMenu(req) {
        let menus = await this.MenuModel.findAll({
            where: {
                accepted: true,
                user_id: req.user.id
            },
            raw: true
        })

        return { menus, menuPage: true }
    }

    async removeMenuItem(id) {
        let item = await this.MenuModel.findByPk(id)

        if (!item)
            throw new BadRequestException('No such item exists')

        await item.destroy()
        return { success: true }
    }

    async getRestaurants() {
        let _restaurants = await this.UserModel.findAll({
            where: {
                '$menus.accepted$': true,
                status: UserStatus.ACTIVE,
            },
            attributes: ['id','restaurant_name'],
            include: {
                model: this.MenuModel,
                attributes: [],
            }
        })

        let restaurants = _restaurants.map(rest=>{
            return {
                ...rest.dataValues
            }
        })

        console.log(restaurants);
        
        return {restaurants, restaurantPage: true}
    }
}
