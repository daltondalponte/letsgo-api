import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger"

export class UserBody {

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    password: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    address: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    document: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    avatar: string;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    isOwnerOfEstablishment: boolean;

    @ApiProperty()
    @IsOptional()
    @IsString()
    type: 'PERSONAL' | 'PROFESSIONAL' | 'TICKETTAKER'

}