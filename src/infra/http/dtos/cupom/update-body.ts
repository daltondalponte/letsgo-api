import { IsNotEmpty, IsString, IsNumber, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger"

export class UpdateBody {
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
    descont_percent?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    discount_value?: number;

    @ApiProperty()
    description?: string;

} 