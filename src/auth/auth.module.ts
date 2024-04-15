import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/db/models/user.model';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JWTStrategy } from './jwt.strategy';

import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET
    }),
    PassportModule.register({
      defaultStrategy: 'jwt'
    })
  ],
  providers: [AuthService, JWTStrategy,],
  controllers: [AuthController],
  exports: [AuthModule]
})
export class AuthModule { }
