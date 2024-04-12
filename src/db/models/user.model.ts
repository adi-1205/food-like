import { DataTypes } from 'sequelize';
import { Column, Table, Model, HasMany } from 'sequelize-typescript';
import { Role } from 'src/shared/enums/role.enum';
import { UserStatus } from 'src/shared/enums/status.enum';
import { Menu } from './menu.model';
import { Cart } from './cart.model';

@Table({
    tableName: 'user',
    paranoid: true,
    timestamps: true
})
export class User extends Model<User> {
    @Column({
        type: DataTypes.STRING,
        allowNull: false,
    })
    email: string;

    @Column({
        type: DataTypes.STRING
    })
    password: string;

    @Column({
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    })
    verified: boolean;

    @Column({
        type: DataTypes.STRING,
    })
    invite_token: string;

    @Column({
        type: DataTypes.STRING,
    })
    invite_expiry: string;

    @Column({
        defaultValue: Role.USER,
    })
    role: Role;

    @Column({
        defaultValue: UserStatus.INACTIVE,
    })
    status: UserStatus;

    @Column({ type: DataTypes.STRING })
    restaurant_name: string

    @HasMany(() => Menu)
    menus: Menu[];

    @HasMany(() => Cart)
    carts: Cart[];
}
