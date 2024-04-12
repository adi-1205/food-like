import { IsEmail, IsNotEmpty, Length, MinLength } from "class-validator";


export class CreateInvitation {

    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsNotEmpty()
    @MinLength(5)
    restName: string

}