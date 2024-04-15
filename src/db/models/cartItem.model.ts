import { Table, Column, Model, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.model';
import { Menu } from './menu.model';
import { Cart } from './cart.model';

@Table({
    tableName: 'cart_item',
    timestamps: true,
    paranoid: true
})
export class CartItem extends Model<CartItem> {

    @Column
    qty: number

    @ForeignKey(() => Cart)
    @Column
    cart_id: number;

    @ForeignKey(() => Menu)
    @Column
    menu_id: number;

    @BelongsTo(() => Cart)
    cart: Cart;

    @BelongsTo(() => Menu)
    menu: Menu;
}