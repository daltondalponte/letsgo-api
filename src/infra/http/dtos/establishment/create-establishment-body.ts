import { Type } from "class-transformer";
import { ArrayMinSize, ValidateNested, IsArray, IsNotEmpty, IsString, IsObject, IsDefined, IsNotEmptyObject, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger"

class Coord {
    @ApiProperty()
    @IsNotEmpty()
    latitude: number;

    @ApiProperty()
    @IsNotEmpty()
    longitude: number;
}

export class EstablishmentBody {

    @ApiProperty({ description: 'Nome do estabelecimento' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'Endereço do estabelecimento' })
    @IsNotEmpty()
    @IsString()
    address: string;

    @ApiProperty({ description: 'Coordenadas geográficas do estabelecimento' })
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Coord)
    coordinates: Coord;

    @ApiProperty({ description: 'Fotos do estabelecimento', type: [String], required: false })  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    photos?: string[]

    @ApiProperty({ description: 'Descrição do estabelecimento', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'Telefone de contato', required: false })
    @IsOptional()
    @IsString()
    contactPhone?: string;

    @ApiProperty({ description: 'Website do estabelecimento', required: false })
    @IsOptional()
    @IsString()
    website?: string;

    @ApiProperty({ description: 'Redes sociais do estabelecimento', required: false })
    @IsOptional()
    socialMedia?: any;
}