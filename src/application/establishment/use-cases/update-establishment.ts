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

        const { establishment } = await this.establishmentRepository.findById(id)

        if (userOwnerUid && establishment.userOwnerUid !== userOwnerUid) {
            throw new UnauthorizedException("Não autorizado")
        }

        if (name) establishment.name = name
        if (address) establishment.address = address
        if (coordinates) establishment.coord = coordinates
        if (description) establishment.description = description
        if (contactPhone) establishment.contactPhone = contactPhone
        if (website) establishment.website = website
        if (socialMedia) establishment.socialMedia = socialMedia

        await this.establishmentRepository.save(establishment)
    }
} 