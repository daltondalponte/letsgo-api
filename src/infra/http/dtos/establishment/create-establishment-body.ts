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

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    address: string;

    @ApiProperty()
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Coord)
    coordinates: Coord;

    @ApiProperty()  
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    photos: string[]

    @ApiProperty()
    @IsOptional()
    @IsString()
    description: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    contactPhone: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    website: string;

    @ApiProperty()
    @IsOptional()
    socialMedia: any;
}