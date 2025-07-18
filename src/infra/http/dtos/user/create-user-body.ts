import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger"

export class UserBody {

    @ApiProperty({
        description: 'Nome completo do usuário',
        example: 'João Silva',
        minLength: 2,
        maxLength: 100
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Email do usuário (deve ser único)',
        example: 'joao@email.com',
        format: 'email'
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Senha do usuário (mínimo 8 caracteres)',
        example: 'senha123',
        minLength: 8
    })
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

    @ApiProperty({
        description: 'Tipo do usuário',
        example: 'PERSONAL',
        enum: ['PERSONAL', 'PROFESSIONAL_OWNER', 'PROFESSIONAL_PROMOTER', 'TICKETTAKER'],
        default: 'PERSONAL'
    })
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