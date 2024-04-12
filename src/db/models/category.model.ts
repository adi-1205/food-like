import { Column, Table, Model } from 'sequelize-typescript';

@Table({
    tableName: 'category',
    paranoid: true,
    timestamps: true
})
export class Category extends Model<Category> {
    @Column
    name: string;
}
