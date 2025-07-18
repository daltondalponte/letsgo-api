import { IsNotEmpty, IsString, IsNumber, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger"

export class UpdateBody {
    @ApiProperty({
        description: 'Código único do cupom (ex: "DESCONTO10")',
        example: 'DESCONTO10',
        minLength: 3,
        maxLength: 20
    })
    @IsNotEmpty()
    @IsString()
    code: string;

    @ApiProperty({
        description: 'Quantidade de vezes que o cupom pode ser usado',
        example: 100,
        minimum: 1
    })
    @IsNotEmpty()
    @IsNumber()
    quantity_available: number;

    @ApiProperty({
        description: 'ID do evento específico (opcional - se não informado, o cupom será global)',
        example: 'event-123',
        required: false
    })
    @IsOptional()
    @IsString()
    eventId?: string;

    @ApiProperty({
        description: 'Percentual de desconto (ex: 10 para 10%)',
        example: 10,
        minimum: 0,
        maximum: 100,
        required: false
    })
    @IsOptional()
    @IsNumber()
    descont_percent?: number;

    @ApiProperty({
        description: 'Valor fixo de desconto em reais',
        example: 25.50,
        minimum: 0,
        required: false
    })
    @IsOptional()
    @IsNumber()
    discount_value?: number;

    @ApiProperty({
        description: 'Descrição opcional do cupom',
        example: 'Cupom de desconto para novos clientes',
        required: false
    })
    description?: string;

    @ApiProperty({
        description: 'Data de expiração do cupom (formato ISO)',
        example: '2024-12-31T23:59:59.000Z',
        required: false
    })
    @IsOptional()
    @IsString()
    expiresAt?: string;

} 