import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateDeviceTokenBody {
    @ApiProperty({ description: 'Token do dispositivo para notificações push' })
    @IsNotEmpty()
    @IsString()
    deviceToken: string;
} 