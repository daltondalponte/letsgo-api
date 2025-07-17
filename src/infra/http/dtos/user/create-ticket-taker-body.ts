import { IsNotEmpty, IsEmail, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateTicketTakerBody {
    @ApiProperty({ description: 'Email do ticket taker' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'Nome do ticket taker' })
    @IsNotEmpty()
    @IsString()
    name: string;
} 