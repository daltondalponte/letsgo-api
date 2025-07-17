import { IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserBody {
    @ApiProperty({ description: 'Nome do usuário', required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ description: 'Avatar do usuário', required: false })
    @IsOptional()
    @IsString()
    avatar?: string;

    @ApiProperty({ description: 'Documento do usuário', required: false })
    @IsOptional()
    @IsString()
    document?: string;
} 