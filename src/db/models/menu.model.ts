import { DataTypes } from 'sequelize';
import { Column, Table, Model, ForeignKey, BelongsTo, HasMany, BelongsToMany } from 'sequelize-typescript';
import { User } from './user.model'; // Adjust the path to your User model
import { Cart } from './cart.model';

@Table({
    tableName: 'menu',
    paranoid: true,
    timestamps: true
})
export class Menu extends Model<Menu> {
    @Column({
        type: DataTypes.STRING,
        allowNull: false,
    })
    name: string;

    @Column({
        type: DataTypes.DECIMAL(10, 2), // Use DECIMAL for prices to handle currency values accurately
        allowNull: false,
    })
    price: number;

    @Column({
        type: DataTypes.STRING,
        allowNull: false,
    })
    image: string;

    @Column({
        type: DataTypes.STRING,
    })
    description: string;

    @Column({
        type: DataTypes.BOOLEAN,
        defaultValue: false
    })
    accepted: boolean;

    @ForeignKey(() => User)
    @Column
    user_id: number;

    @BelongsTo(() => User)
    user: User; 

    @HasMany(() => Cart)
    carts: Cart[];

    @BelongsToMany(() => User, () => Cart)
    users: User[];
}

