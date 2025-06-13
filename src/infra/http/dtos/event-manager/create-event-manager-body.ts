import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger"
import { $Enums } from "@prisma/client";

export class EventManagerBody {

    @ApiProperty()
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    recursos: $Enums.Recurso[];

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    eventId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    email: string;

}