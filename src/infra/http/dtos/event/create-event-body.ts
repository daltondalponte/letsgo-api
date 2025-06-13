import { Type } from "class-transformer";
import { ArrayMinSize, ValidateNested, IsArray, IsDate, IsNotEmpty, IsOptional, IsString, IsNumber, IsObject, IsDefined, IsNotEmptyObject, IsDateString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger"

class Coord {
    @ApiProperty()
    @IsNotEmpty()
    latitude: number;

    @ApiProperty()
    @IsNotEmpty()
    longitude: number;
}

export class EventBody {

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    address: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    establishmentId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsDateString()
    dateTimestamp: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    description: string;

    coordinates_event?: Coord;

    @ApiProperty()
    @IsArray()
    @IsOptional()
    ticketTakers: string[]

    @ApiProperty()
    @IsArray()
    @IsOptional()
    listNames: string[]

    @ApiProperty()
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    photos: string[]

}