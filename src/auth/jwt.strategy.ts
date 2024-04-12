import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from '@nestjs/passport';
import { InjectModel } from "@nestjs/sequelize";
import { Strategy } from 'passport-jwt';
import { User } from "../db/models/user.model";
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectModel(User) private readonly UserModel: typeof User,
    ) {
        super({
            jwtFromRequest: function (req) {
                var token = null;
                if (req && req.cookies) {
                    token = req.cookies['auth'];
                }

                return token;
            },
            secretOrKey: process.env.JWT_SECRET,

        })
    }

    async validate(payload) {
        const { id } = payload
        const user = await this.UserModel.findByPk(id)
        if (!user) {
            throw new UnauthorizedException()
        }
        return user
    }
}