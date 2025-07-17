import { Type } from "class-transformer";
import { ValidateNested, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UserBody } from "./create-user-body";
import { EstablishmentBody } from "../establishment/create-establishment-body";

export class CreateProfessionalBody extends UserBody {
    @ApiProperty({ 
        type: EstablishmentBody, 
        description: 'Dados do estabelecimento (obrigatório se isOwnerOfEstablishment for true)',
        required: false 
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => EstablishmentBody)
    establishment?: EstablishmentBody;
}
 