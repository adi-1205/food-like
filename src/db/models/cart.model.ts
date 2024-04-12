import { Table, Column, Model, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.model';
import { Menu } from './menu.model';

@Table({
    tableName: 'cart', // Name of the intermediary table
    timestamps: true,
    paranoid: true
})
export class Cart extends Model<Cart> {
    @ForeignKey(() => User)
    @Column
    user_id: number;

    @ForeignKey(() => Menu)
    @Column
    menu_id: number;

    // Define associations
    @BelongsTo(() => User)
    user: User;

    @BelongsTo(() => Menu)
    menu: Menu;
}