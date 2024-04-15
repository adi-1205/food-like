import { Table, Column, Model, ForeignKey, BelongsTo, BelongsToMany } from 'sequelize-typescript';
import { User } from './user.model';
import { Menu } from './menu.model';
import { CartItem } from './cartItem.model';

@Table({
    tableName: 'cart',
    timestamps: true,
    paranoid: true
})
export class Cart extends Model<Cart> {

    @ForeignKey(() => User)
    user_id: number

    @BelongsTo(() => User)
    user: User

    @BelongsToMany(()=>Menu,()=>CartItem)
    menus: Menu[]
    
}