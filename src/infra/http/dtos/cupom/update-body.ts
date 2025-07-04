import { IsNotEmpty, IsString, IsNumber } from "class-validator";
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
    @IsNotEmpty()
    @IsNumber()
    eventId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    descont_percent: number;

} 