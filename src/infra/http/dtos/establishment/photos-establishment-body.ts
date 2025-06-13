import { ArrayMinSize, IsArray, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger"

export class PhotoEstablishmentBody {

    @ApiProperty()  
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    photos: string[]

}