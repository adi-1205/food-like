import { Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import * as dotenv from 'dotenv';
dotenv.config();

@Global()
@Module({
    imports:[
        SequelizeModule.forRoot({
          dialect:'mysql',
          host: process.env.DB_HOST,
          username: process.env.DB_USER,
          password: process.env.DB_PASS,
          database: process.env.DB_NAME,
          autoLoadModels: true,
          // sync:{alter:true},
        })]
})
export class DbModule {}
