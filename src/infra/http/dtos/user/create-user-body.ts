import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
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
    @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres' })
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
    type: 'PERSONAL' | 'PROFESSIONAL_OWNER' | 'PROFESSIONAL_PROMOTER' | 'TICKETTAKER'

    @ApiProperty()
    @IsOptional()
    @IsString()
    phone: string;

    @ApiProperty()
    @IsOptional()
    birthDate: Date;
}