import { IsNotEmpty, IsEmail, IsString, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateTicketTakerBody {
    @ApiProperty({ description: 'ID do ticket taker' })
    @IsNotEmpty()
    @IsUUID()
    id: string;

    @ApiProperty({ description: 'Nome do ticket taker' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'Email do ticket taker' })
    @IsNotEmpty()
    @IsEmail()
    email: string;
} 