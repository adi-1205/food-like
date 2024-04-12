import { Body, Controller, Get, Param, Post, Put, Render, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { CreateInvitation } from './dto/createInvitation.dto';
import * as moment from 'moment';

@Controller('admin')
export class AdminController {

    constructor(
        private adminService: AdminService
    ) { }

    @Get()
    @Render('admin/invites')
    @Roles(Role.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getViewInvites() {
        let { invites: _invites } = await this.adminService.getInvites()

        let invites = _invites.map((invite, ind) => {
            let userStatus = invite.verified ? 'Verified' : 'Not verified'
            return {
                ...invite,
                userStatus,
                ind: ind + 1
            }
        })
        return { invites, invitePage: true }
    }

    @Get('requests')
    @Render('admin/requests')
    @Roles(Role.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getViewRequests() {
        let { requests: _requests } = await this.adminService.getRequests()

        let requests = _requests.map((request, ind) => {
            return {
                ...request,
                ind: ind + 1,
                email:request['user.email'],
                restName:request['user.restaurant_name'],
            }
        })

        return { requests, requestPage: true }
    }

    @Post()
    @Roles(Role.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @UsePipes(ValidationPipe)
    async createInvite(@Body() invitation: CreateInvitation) {
        return await this.adminService.createInvite(invitation)
    }

    @Put('approve/:id')
    @Roles(Role.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async approveMenuItem(@Param('id') id){
        return await this.adminService.approveMenuItem(id)
    }


}
