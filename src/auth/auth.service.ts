import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/db/models/user.model';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as moment from 'moment';
import { VerifyDto } from './dto/verify.dto';
import { UserStatus } from 'src/shared/enums/status.enum';
import { Role } from 'src/shared/enums/role.enum';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User)
        private readonly UserModel: typeof User,
        private jwtService: JwtService
    ) { }


    async postLogin(res, loginDto: LoginDto) {
        let user = await this.UserModel.findOne({ where: { email: loginDto.email } })

        if (!user)
            throw new BadRequestException('Email does not exist')

        let isMatch = bcrypt.compareSync(loginDto.password, user.password)

        if (!isMatch)
            throw new BadRequestException('Invalid credential')

        let token = this.jwtService.sign({ id: user.id })
        res.cookie('auth', token)
        let redirect 
        if(user.role == Role.ADMIN)
            redirect = '/admin'
        if(user.role == Role.USER)
            redirect = '/user'
        if(user.role == Role.CUSTOMER)
            redirect = '/restaurants'
        return { redirect }
    }

    async postVerify(token, verify: VerifyDto) {
        let invitedUser = await this.UserModel.findOne({
            where: {
                invite_token: token
            }
        })

        if (!invitedUser) throw new BadRequestException('Invalid invitation')

        if (moment().isAfter(invitedUser.invite_expiry))
            throw new BadRequestException('Invitaion expired')


        if (verify.password !== verify.cpassword)
            throw new BadRequestException('Password should match')


        invitedUser.password = bcrypt.hashSync(verify.password, 12)
        invitedUser.status = UserStatus.ACTIVE
        invitedUser.verified = true
        invitedUser.invite_token = null
        invitedUser.invite_expiry = null
        await invitedUser.save()

        return { success: true }
    }

}


