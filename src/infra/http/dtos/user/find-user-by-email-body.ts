import { IsEmail, IsNotEmpty } from "class-validator";

export class FindUserByEmailBody {
    @IsNotEmpty()
    @IsEmail()
    email: string;

}