import { IsNotEmpty, IsString, IsNumber, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger"

export class TicketBody {

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    price: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    eventId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    quantity_available: number;

}