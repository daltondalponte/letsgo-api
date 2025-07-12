    import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Coord, Establishment } from "../entity/Establishment";
import { EstablishmentRepository } from "../repositories/establishment-repository";

interface EstablishmentRequest {
    id: string;
    name?: string;
    address?: string;
    coordinates?: Coord;
    description?: string;
    contactPhone?: string;
    website?: string;
    socialMedia?: any;
    userOwnerUid?: string | null;
}

@Injectable()
export class UpdateEstablishment {

    constructor(
        private establishmentRepository: EstablishmentRepository
    ) { }

    async execute(request: EstablishmentRequest): Promise<void> {
        const { id, name, address, coordinates, description, contactPhone, website, socialMedia, userOwnerUid } = request

        console.log('🔍 UpdateEstablishment.execute - Dados recebidos:');
        console.log('ID:', id);
        console.log('Coordenadas:', coordinates);
        console.log('Nome:', name);
        console.log('Endereço:', address);

        const { establishment } = await this.establishmentRepository.findById(id)

        console.log('📍 Estabelecimento encontrado:', {
            id: establishment.id,
            name: establishment.name,
            currentCoordinates: establishment.coord
        });

        if (userOwnerUid && establishment.userOwnerUid !== userOwnerUid) {
            throw new UnauthorizedException("Não autorizado")
        }

        if (name) {
            console.log('📝 Atualizando nome:', establishment.name, '->', name);
            establishment.name = name;
        }
        if (address) {
            console.log('📝 Atualizando endereço:', establishment.address, '->', address);
            establishment.address = address;
        }
        if (coordinates) {
            console.log('📝 Atualizando coordenadas:', establishment.coord, '->', coordinates);
            establishment.coord = coordinates;
        }
        if (description) establishment.description = description
        if (contactPhone) establishment.contactPhone = contactPhone
        if (website) establishment.website = website
        if (socialMedia) establishment.socialMedia = socialMedia

        console.log('💾 Salvando estabelecimento...');
        await this.establishmentRepository.save(establishment)
        console.log('✅ Estabelecimento salvo com sucesso');
    }
} 