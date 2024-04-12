import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class VerifyDto {

    @IsNotEmpty({ message: 'Password should not be empty' })
    @MinLength(5)
    password: string

    @IsNotEmpty({ message: 'Confirm Password should not be empty' })
    @MinLength(5)
    cpassword: string
}