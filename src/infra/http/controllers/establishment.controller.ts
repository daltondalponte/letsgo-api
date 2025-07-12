import { Controller, Body, UseGuards, Post, Get, Request, Put, Param, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateEstablishment } from '@application/establishment/use-cases/create-establishment';
import { FindEstablishmentByUserUid } from '@application/establishment/use-cases/find-many-by-user';
import { EstablishmentBody } from '../dtos/establishment/create-establishment-body';
import { EstablishmentViewModel } from '../view-models/establishment/establishment-view-model';
import { ApiTags } from '@nestjs/swagger';
import { FindAllEstablishments } from '@application/establishment/use-cases/find-many';
import { PhotoEstablishmentBody } from '../dtos/establishment/photos-establishment-body';
import { UpdateEstablishmentPhoto } from '@application/establishment/use-cases/update-photos';
import { UpdateEstablishment } from '@application/establishment/use-cases/update-establishment';
import { EnsureProfessionalUser } from '../auth/guards/ensure-professional-user.guard';

@ApiTags("Estabelecimento")
@Controller("establishment")
export class EstablishmentController {

    constructor(
        private createEstablishment: CreateEstablishment,
        private updateEstablishmentPhoto: UpdateEstablishmentPhoto,
        private updateEstablishment: UpdateEstablishment,
        private findManyByUser: FindEstablishmentByUserUid,
        private findAllEstablishments: FindAllEstablishments
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post("create")
    async create(@Request() req, @Body() body: EstablishmentBody) {
        const { userId: useruid } = req.user

        // Conversão defensiva das coordenadas
        if (body.coordinates) {
          if ('lat' in body.coordinates && 'lng' in body.coordinates) {
            body.coordinates = {
              latitude: Number(body.coordinates.lat),
              longitude: Number(body.coordinates.lng)
            };
          }
        }

        const { address, photos, coordinates, name, description, contactPhone, website, socialMedia } = body

        const { establishment } = await this.createEstablishment.execute(
            {
                userOwnerUid: useruid,
                address,
                photos,
                coordinates,
                name,
                description,
                contactPhone,
                website,
                socialMedia
            }
        )

        return { establishment: EstablishmentViewModel.toHTTP(establishment) }
    }

    @UseGuards(JwtAuthGuard)
    @Put("update")
    async update(@Query() id, @Request() req, @Body() body: PhotoEstablishmentBody) {
        const { userId: useruid } = req.user

        const { photos } = body

        await this.updateEstablishmentPhoto.execute(
            {
                userOwnerUid: useruid,
                photos,
                id: id.id
            }
        )
    }

    @UseGuards(JwtAuthGuard)
    @Put("admin/update/:id")
    async updateByAdmin(@Param("id") id: string, @Request() req, @Body() body: { name?: string; address?: string; coordinates?: any; description?: string; contactPhone?: string; website?: string; socialMedia?: any }) {
        const { userId: useruid, type } = req.user;
        
        console.log('🔍 DEBUG - Dados recebidos para atualização:');
        console.log('ID:', id);
        console.log('Body completo:', JSON.stringify(body, null, 2));
        console.log('Coordenadas recebidas:', body.coordinates);
        
        // Conversão defensiva das coordenadas
        if (body.coordinates) {
          console.log('📍 Coordenadas antes da conversão:', body.coordinates);
          if ('lat' in body.coordinates && 'lng' in body.coordinates) {
            body.coordinates = {
              latitude: Number(body.coordinates.lat),
              longitude: Number(body.coordinates.lng)
            };
            console.log('🔄 Coordenadas convertidas de {lat,lng} para {latitude,longitude}:', body.coordinates);
          } else if ('latitude' in body.coordinates && 'longitude' in body.coordinates) {
            console.log('✅ Coordenadas já estão no formato correto:', body.coordinates);
          } else {
            console.log('⚠️ Formato de coordenadas desconhecido:', body.coordinates);
          }
        } else {
          console.log('❌ Nenhuma coordenada recebida');
        }
        
        // Se for MASTER, permitir editar qualquer estabelecimento
        // Se não for MASTER, usar o userOwnerUid normal
        const userOwnerUid = type === "MASTER" ? null : useruid;
        
        console.log('📤 Enviando para updateEstablishment.execute:', {
            id,
            userOwnerUid,
            name: body.name,
            address: body.address,
            coordinates: body.coordinates,
            description: body.description,
            contactPhone: body.contactPhone,
            website: body.website,
            socialMedia: body.socialMedia
        });
        
        await this.updateEstablishment.execute({
            id,
            userOwnerUid,
            name: body.name,
            address: body.address,
            coordinates: body.coordinates,
            description: body.description,
            contactPhone: body.contactPhone,
            website: body.website,
            socialMedia: body.socialMedia
        });

        console.log('✅ Estabelecimento atualizado com sucesso');
        return { message: 'Estabelecimento atualizado com sucesso' };
    }

    @UseGuards(JwtAuthGuard)
    @Get("find-by-user")
    async findEventsByUserUidOrEstablishmentId(@Request() req, @Body() body) {
        const { userId: useruid } = req.user

        const { establishment } = await this.findManyByUser.execute({ useruid })

        return { establishment: EstablishmentViewModel.toHTTP(establishment) }
    }

    @UseGuards(JwtAuthGuard)
    @Get("/")
    async findAll(@Request() req, @Body() body) {

        const { establishments } = await this.findAllEstablishments.execute()

        return { establishments: establishments.map(EstablishmentViewModel.toHTTP) }
    }

    @Get("map")
    async findForMap() {
        console.log('🔍 Buscando estabelecimentos para o mapa...');
        
        const { establishments } = await this.findAllEstablishments.execute()
        console.log('📊 Total de estabelecimentos encontrados:', establishments.length);

        // Log dos primeiros estabelecimentos para debug
        establishments.slice(0, 3).forEach((est, index) => {
            console.log(`📍 Estabelecimento ${index + 1}:`, {
                name: est.name,
                coord: est.coord,
                coordType: typeof est.coord,
                hasCoord: !!est.coord
            });
        });

        // Filtrar apenas estabelecimentos que têm coordenadas válidas
        const validEstablishments = establishments.filter(est => {
            const isValid = est.coord && 
                   typeof est.coord.latitude === 'number' && 
                   typeof est.coord.longitude === 'number';
            
            if (!isValid) {
                console.log(`❌ Estabelecimento ${est.name} não tem coordenadas válidas:`, est.coord);
            }
            
            return isValid;
        });

        console.log('✅ Estabelecimentos com coordenadas válidas:', validEstablishments.length);

        return { establishments: validEstablishments.map(EstablishmentViewModel.toHTTP) }
    }

    @UseGuards(JwtAuthGuard)
    @Get("available-for-promoters")
    async findAvailableForPromoters(@Request() req) {
        const { type } = req.user;
        
        // Apenas promoters podem acessar este endpoint
        if (type !== "PROFESSIONAL_PROMOTER") {
            return { establishments: [] };
        }

        const { establishments } = await this.findAllEstablishments.execute()

        // Filtrar apenas estabelecimentos de owners (não de promoters)
        const availableEstablishments = establishments.filter(est => {
            // Aqui você pode adicionar lógica adicional se necessário
            // Por enquanto, retorna todos os estabelecimentos
            return true;
        });

        return { establishments: availableEstablishments.map(EstablishmentViewModel.toHTTP) }
    }

    @UseGuards(JwtAuthGuard)
    @Get("search-for-promoters")
    async searchEstablishmentsForPromoters(@Request() req, @Query('query') query: string) {
        const { type } = req.user;
        
        // Apenas promoters podem acessar este endpoint
        if (type !== "PROFESSIONAL_PROMOTER") {
            return { establishments: [] };
        }

        if (!query || query.trim().length < 2) {
            return { establishments: [] };
        }

        const { establishments } = await this.findAllEstablishments.execute()

        // Filtrar estabelecimentos que correspondem à busca
        const filteredEstablishments = establishments.filter(est => {
            const searchTerm = query.toLowerCase();
            return (
                est.name.toLowerCase().includes(searchTerm) ||
                est.address?.toLowerCase().includes(searchTerm) ||
                est.description?.toLowerCase().includes(searchTerm)
            );
        });

        return { establishments: filteredEstablishments.map(EstablishmentViewModel.toHTTP) }
    }
}