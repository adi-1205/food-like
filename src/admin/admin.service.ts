import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateInvitation } from './dto/createInvitation.dto';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { User } from 'src/db/models/user.model';
import * as crypto from 'node:crypto';
import * as moment from 'moment';
import { MailService } from 'src/mail/mail.service';
import { Op } from 'sequelize';
import { Sequelize } from "sequelize-typescript";
import { Menu } from 'src/db/models/menu.model';


@Injectable()
export class AdminService {
    constructor(
        @InjectModel(User)
        private readonly UserModel: typeof User,
        @InjectModel(Menu)
        private readonly MenuModel: typeof Menu,
        private mailService: MailService,
        @InjectConnection() private seq: Sequelize
    ) {
    }

    async createInvite(invitation: CreateInvitation) {

        const t = await this.seq.transaction()


        let invite_token = crypto.randomBytes(8).toString('hex')

        // if invitation exist
        // reinvite after invite expires
        let existing = await this.UserModel.findOne({ where: { email: invitation.email } })
        if (existing) {
            if (moment().isBefore(existing.invite_expiry))
                throw new BadRequestException('Invitation already sent')
            else {
                existing.invite_expiry = oneDayFromNow()
                existing.invite_token = invite_token
                await existing.save()
                return { success: true, message: 'User Reinvited' }
            }
        }

        await User.create({
            email: invitation.email,
            invite_token,
            invite_expiry: oneDayFromNow(),
            restaurant_name: invitation.restName
        }, {
            transaction: t
        })

        let data = await this.mailService.sendInviteMail(invitation.email, invite_token)



        if (data.sent) {
            t.commit()
            return { success: true, message: 'Invitation sent!' }
        }
        else {
            t.rollback()
            throw new InternalServerErrorException('Something went wrong')
        }

    }

    async getInvites() {
        let invites = await this.UserModel.findAll({
            where: {
                // invite_token: {
                //     [Op.ne]: null
                // }
                verified: false
            },
            attributes: ['email', 'restaurant_name', 'verified', 'invite_expiry', 'status'],
            raw: true
        })

        return { invites }
    }

    async getRequests() {


        let requests = await this.MenuModel.findAll({
            where: {
                accepted: false
            },
            attributes: ['id', 'name', 'price', 'description', 'image'],
            include: {
                model: this.UserModel,
                attributes: ['email', 'restaurant_name']
            },
            raw: true
        })

        console.log(requests);

        return { requests }
    }

    async approveMenuItem(id) {
        let item = await this.MenuModel.findByPk(id)

        if (!item)
            throw new BadRequestException('No such item exists')

        item.accepted = true
        await item.save()
        return { success: true }
    }
}

function oneDayFromNow() {
    return moment().add(1, 'day').format('YYYY-MM-DD HH:mm:ss')
}
