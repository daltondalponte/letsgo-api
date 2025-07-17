import { Type } from "class-transformer";
import { ValidateNested, IsArray, IsOptional, IsString, IsNumber, IsDateString, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

class Coord {
    @ApiProperty({ description: 'Latitude da localização do evento' })
    @IsOptional()
    latitude?: number;

    @ApiProperty({ description: 'Longitude da localização do evento' })
    @IsOptional()
    longitude?: number;
}

class Ticket {
    @ApiProperty({ description: 'Nome do ingresso' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ description: 'Descrição do ingresso' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'Preço do ingresso' })
    @IsOptional()
    @IsNumber()
    price?: number;

    @ApiProperty({ description: 'Quantidade disponível' })
    @IsOptional()
    @IsNumber()
    quantity?: number;

    @ApiProperty({ description: 'Se o ingresso está ativo' })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateEventBody {
    @ApiProperty({ description: 'Nome do evento', required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ description: 'Descrição do evento', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'Data e hora de início do evento (ISO string)', required: false })
    @IsOptional()
    @IsDateString()
    dateTimestamp?: string;

    @ApiProperty({ description: 'Data e hora de término do evento (ISO string)', required: false })
    @IsOptional()
    @IsDateString()
    endTimestamp?: string;

    @ApiProperty({ description: 'Duração do evento em horas', required: false })
    @IsOptional()
    @IsNumber()
    duration?: number;

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
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    photos?: string[];

    @ApiProperty({ description: 'Se o evento está ativo', required: false })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({ description: 'ID do estabelecimento', required: false })
    @IsOptional()
    @IsString()
    establishmentId?: string;

    @ApiProperty({ description: 'Ingressos do evento', type: [Ticket], required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Ticket)
    @IsOptional()
    tickets?: Ticket[];
} 