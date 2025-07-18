import { Type } from "class-transformer";
import { ArrayMinSize, ValidateNested, IsArray, IsDate, IsNotEmpty, IsOptional, IsString, IsNumber, IsObject, IsDefined, IsNotEmptyObject, IsDateString, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

class Coord {
    @ApiProperty({ description: 'Latitude da localização do evento' })
    @IsNotEmpty()
    latitude: number;

    @ApiProperty({ description: 'Longitude da localização do evento' })
    @IsNotEmpty()
    longitude: number;
}

class Ticket {
    @ApiProperty({ description: 'Categoria do ingresso' })
    @IsNotEmpty()
    @IsString()
    category: string;

    @ApiProperty({ description: 'Nome do ingresso' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'Descrição do ingresso' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'Preço do ingresso' })
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    price: number;

    @ApiProperty({ description: 'Quantidade disponível' })
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    quantity: number;

    @ApiProperty({ description: 'Se o ingresso está ativo' })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isActive?: boolean;
}

export class CreateEventBody {
    @ApiProperty({ description: 'Nome do evento' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'Descrição do evento' })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({ description: 'Data e hora de início do evento (ISO string)' })
    @IsNotEmpty()
    @IsDateString()
    dateTimestamp: string;

    @ApiProperty({ description: 'Data e hora de término do evento (ISO string)', required: false })
    @IsOptional()
    @IsDateString()
    endTimestamp?: string;

    @ApiProperty({ description: 'Duração do evento em horas', required: false })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    duration?: number;

    @ApiProperty({ description: 'ID do estabelecimento', required: false })
    @IsOptional()
    @IsString()
    establishmentId?: string;

    @ApiProperty({ description: 'Endereço do evento', required: false })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({ description: 'Coordenadas do evento', required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => Coord)
    coordinates_event?: Coord;

    @ApiProperty({ description: 'Fotos do evento', type: [String], required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    photos?: string[];

    @ApiProperty({ description: 'Ingressos do evento', type: [Ticket], required: false })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => Ticket)
    tickets?: Ticket[];
}