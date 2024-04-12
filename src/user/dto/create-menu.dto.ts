import { IsNotEmpty, IsNumber, IsNumberString } from "class-validator";

export class CreateMenu {

    @IsNotEmpty()
    name: string

    @IsNotEmpty()
    @IsNumberString()
    price: number

    @IsNotEmpty()
    desc: string
}