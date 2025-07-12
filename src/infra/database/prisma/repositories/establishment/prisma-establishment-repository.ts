import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { EstablishmentRepository } from "@application/establishment/repositories/establishment-repository";
import { Establishment } from "@application/establishment/entity/Establishment";
import { PrismaEstablishmentMapper } from "../../mappers/establishment/prisma-establishment-mapper";

@Injectable()
export class PrismaEstablishmentRepository implements EstablishmentRepository {

    constructor(
        private prisma: PrismaService
    ) { }

    async create(establishment: Establishment): Promise<void> {
        const rawEstablishment = PrismaEstablishmentMapper.toPrisma(establishment)

        await this.prisma.establishment.create({
            data: rawEstablishment
        })
    }

    async findByUserUid(uid: string): Promise<Establishment> {
        const establishment = await this.prisma.establishment.findFirst({
            where: {
                userOwnerUid: uid
            }
        })

        return PrismaEstablishmentMapper.toDomain(establishment)
    }

    async find(): Promise<Establishment[]> {
        const establishments = await this.prisma.establishment.findMany()

        return establishments.map(PrismaEstablishmentMapper.toDomain)
    }

    async findById(id: string): Promise<{establishment: Establishment, userOwner: any}> {
        const establishemnt = await this.prisma.establishment.findUnique({
            where: { id },
            include: {
                userOwner: {
                    select: {
                        deviceToken: true
                    }
                }
            }
        })

        return {establishment: PrismaEstablishmentMapper.toDomain(establishemnt), userOwner: establishemnt.userOwner}
    }

    async save(establishment: Establishment): Promise<void> {
        console.log('💾 PrismaEstablishmentRepository.save - Salvando estabelecimento:');
        console.log('ID:', establishment.id);
        console.log('Coordenadas da entidade:', establishment.coord);
        
        const rawEstablishment = PrismaEstablishmentMapper.toPrisma(establishment)
        console.log('📊 Dados convertidos para Prisma:', rawEstablishment);
        
        delete rawEstablishment.id
        console.log('📤 Dados finais para update:', rawEstablishment);
        
        await this.prisma.establishment.update({
            where: {
                id: establishment.id
            },
            data: rawEstablishment
        })
        
        console.log('✅ Estabelecimento atualizado no banco de dados');
    }



}
