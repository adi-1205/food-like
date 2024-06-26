import { Body, Controller, Get, Param, Post, Redirect, Render, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { VerifyDto } from './dto/verify.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Get('login')
    @Render('auth/login')
    getViewLogin() {
        return
    }

    @Get('register')
    @Render('auth/register')
    getViewRegister() {
        return
    }

    @Get('verify/:token')
    @Render('auth/verify')
    getViewVerify(@Param('token') token) {
        return { token }
    }

    @Post('/login')
    @UsePipes(ValidationPipe)
    async postLogin(@Res({ passthrough: true }) res, @Body() loginDto: LoginDto) {
        return await this.authService.postLogin(res, loginDto);
    }
    @Post('/register')
    @UsePipes(ValidationPipe)
    async postRegister(@Body() registerDto: LoginDto) {
        return await this.authService.postRegister(registerDto);
    }

    @Post('/verify/:token')
    @UsePipes(ValidationPipe)
    postVerify(@Param('token') token, @Body() verify: VerifyDto) {
        return this.authService.postVerify(token, verify)
    }


    @Get('/logout')
    @Redirect()
    async getLogout(@Res({ passthrough: true }) res: Response) {
        res.cookie('auth', '', {
            maxAge: -1
        })
        return { url: '/auth/login' };
    }
}
