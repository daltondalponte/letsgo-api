import { IsNotEmpty, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateProfessionalBody {
    @ApiProperty({ description: 'Status ativo/inativo do profissional' })
    @IsNotEmpty()
    @IsBoolean()
    state: boolean;
} 