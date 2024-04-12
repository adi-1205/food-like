import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { SequelizeModule } from '@nestjs/sequelize';
import { Menu } from 'src/db/models/menu.model';
import { User } from 'src/db/models/user.model';
import { Cart } from 'src/db/models/cart.model';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination:'./uploads/',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
    SequelizeModule.forFeature([Menu, User, Cart])
  ],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule { }
