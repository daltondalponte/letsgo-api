import { IsNotEmpty, IsString, IsNumber, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger"

export class CupomBody  {

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    code: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    quantity_available: number;

    @ApiProperty()
    @IsOptional()
    @IsString()
    eventId?: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    descont_percent: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    discont_value: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    expiresAt: string;

    @ApiProperty()
    description?: string;

}