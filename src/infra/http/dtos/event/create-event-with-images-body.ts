import { Type } from "class-transformer";
import { ValidateNested, IsArray, IsOptional, IsString, IsNumber, IsDateString, IsBoolean, IsNotEmpty } from "class-validator";
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
}

class ImageData {
    @ApiProperty({ description: 'Nome do arquivo' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Tipo MIME do arquivo' })
    @IsString()
    type: string;

    @ApiProperty({ description: 'Dados da imagem em base64' })
    @IsString()
    data: string;
}

export class CreateEventWithImagesBody {
    @ApiProperty({ description: 'Nome do evento' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Descrição do evento' })
    @IsString()
    description: string;

    @ApiProperty({ description: 'Data e hora de início do evento (ISO string)' })
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

    @ApiProperty({ description: 'Imagens do evento em base64', type: [ImageData], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ImageData)
    images?: ImageData[];

    @ApiProperty({ description: 'Ingressos do evento', type: [Ticket], required: false })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => Ticket)
    tickets?: Ticket[];
} 