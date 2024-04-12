import { Body, Controller, Delete, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, Post, Render, Req, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { CreateMenu } from './dto/create-menu.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {

    constructor(
        private userService: UserService
    ) { }

    @Get()
    @Roles(Role.USER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Render('user/menu')
    async getViewMenu(@Req() req) {
        return await this.userService.getFullMenu(req)
    }
    // @Get('restaurants')
    // @Roles(Role.USER)
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Render('user/restaurants')
    // async getViewRestaurants() {
    //     return await this.userService.getRestaurants()
    // }

    @Post()
    @UsePipes(ValidationPipe)
    @Roles(Role.USER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @UseInterceptors(FileInterceptor('image'))
    async createMenu(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),//10 mb file limit
                    new FileTypeValidator({ fileType: /image\/(jpeg|jpg|png)/i }),
                ],
            }),
        ) file: Express.Multer.File,
        @Body() menu: CreateMenu,
        @Req() req
    ) {
        return await this.userService.createMenu(req, file, menu)
    }

    @Delete(':id')
    @Roles(Role.USER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async approveMenuItem(@Param('id') id){
        return await this.userService.removeMenuItem(id)
    }
}
