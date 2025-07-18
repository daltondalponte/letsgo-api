import { Controller, Body, UseGuards, Post, Get, Request, Put, Param, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateEstablishment } from '@application/establishment/use-cases/create-establishment';
import { FindEstablishmentByUserUid } from '@application/establishment/use-cases/find-many-by-user';
import { EstablishmentBody } from '../dtos/establishment/create-establishment-body';
import { EstablishmentViewModel } from '../view-models/establishment/establishment-view-model';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { FindAllEstablishments } from '@application/establishment/use-cases/find-many';
import { PhotoEstablishmentBody } from '../dtos/establishment/photos-establishment-body';
import { UpdateEstablishmentPhoto } from '@application/establishment/use-cases/update-photos';
import { UpdateEstablishment } from '@application/establishment/use-cases/update-establishment';
import { EnsureProfessionalUser } from '../auth/guards/ensure-professional-user.guard';

@ApiTags("Establishments")
@Controller("establishments")
export class EstablishmentController {

    constructor(
        private createEstablishment: CreateEstablishment,
        private updateEstablishmentPhoto: UpdateEstablishmentPhoto,
        private updateEstablishment: UpdateEstablishment,
        private findManyByUser: FindEstablishmentByUserUid,
        private findAllEstablishments: FindAllEstablishments
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiOperation({ 
        summary: 'Criar novo estabelecimento',
        description: 'Cria um novo estabelecimento no sistema. Apenas usuários profissionais podem criar estabelecimentos.'
    })
    @ApiBody({ 
        type: EstablishmentBody,
        description: 'Dados do estabelecimento a ser criado',
        examples: {
            estabelecimentoCompleto: {
                summary: 'Estabelecimento completo',
                value: {
                    name: 'Casa de Festas ABC',
                    description: 'Local perfeito para eventos especiais',
                    address: 'Rua das Flores, 123 - São Paulo, SP',
                    coordinates: {
                        latitude: -23.5505,
                        longitude: -46.6333
                    },
                    contactPhone: '(11) 99999-9999',
                    website: 'https://casafestasabc.com',
                    socialMedia: {
                        instagram: '@casafestasabc',
                        facebook: 'Casa de Festas ABC'
                    },
                    photos: ['url-da-foto-1', 'url-da-foto-2']
                }
            }
        }
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Estabelecimento criado com sucesso',
        schema: {
            type: 'object',
            properties: {
                establishment: { type: 'object', description: 'Dados do estabelecimento criado' }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Dados inválidos' })
    @ApiResponse({ status: 401, description: 'Não autorizado' })
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
    @Put("admin/update/:id")
    @ApiOperation({ 
        summary: 'Atualizar estabelecimento (Admin)',
        description: 'Permite que administradores atualizem qualquer estabelecimento.'
    })
    @ApiResponse({ status: 200, description: 'Estabelecimento atualizado com sucesso' })
    @ApiResponse({ status: 400, description: 'Dados inválidos' })
    @ApiResponse({ status: 401, description: 'Não autorizado' })
    @ApiResponse({ status: 404, description: 'Estabelecimento não encontrado' })
    async updateByAdmin(@Param("id") id: string, @Request() req, @Body() body: { name?: string; address?: string; coordinates?: any; description?: string; contactPhone?: string; website?: string; socialMedia?: any }) {
        const { userId: useruid, type } = req.user;
        
        // Conversão defensiva das coordenadas
        if (body.coordinates) {
          if ('lat' in body.coordinates && 'lng' in body.coordinates) {
            body.coordinates = {
              latitude: Number(body.coordinates.lat),
              longitude: Number(body.coordinates.lng)
            };
          }
        }
        
        // Se for MASTER, permitir editar qualquer estabelecimento
        // Se não for MASTER, usar o userOwnerUid normal
        const userOwnerUid = type === "MASTER" ? null : useruid;
        
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

        return { message: 'Establishment updated successfully' };
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    @ApiOperation({ 
        summary: 'Listar todos os estabelecimentos',
        description: 'Retorna todos os estabelecimentos cadastrados no sistema.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Estabelecimentos encontrados com sucesso',
        schema: {
            type: 'object',
            properties: {
                establishments: { 
                    type: 'array',
                    items: { type: 'object' },
                    description: 'Lista de todos os estabelecimentos'
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Não autorizado' })
    async findAll(@Request() req, @Body() body) {

        const { establishments } = await this.findAllEstablishments.execute()

        return { establishments: establishments.map(EstablishmentViewModel.toHTTP) }
    }

    @Get("map")
    @ApiOperation({ 
        summary: 'Buscar estabelecimentos para o mapa',
        description: 'Retorna estabelecimentos com coordenadas válidas para exibição no mapa do app mobile.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Estabelecimentos encontrados com sucesso',
        schema: {
            type: 'object',
            properties: {
                establishments: { 
                    type: 'array',
                    items: { type: 'object' },
                    description: 'Lista de estabelecimentos com coordenadas válidas'
                }
            }
        }
    })
    async findForMap() {
        const { establishments } = await this.findAllEstablishments.execute()

        // Filtrar apenas estabelecimentos que têm coordenadas válidas
        const validEstablishments = establishments.filter(est => {
            return est.coord && 
                   typeof est.coord.latitude === 'number' && 
                   typeof est.coord.longitude === 'number';
        });

        return { establishments: validEstablishments.map(EstablishmentViewModel.toHTTP) }
    }

    @UseGuards(JwtAuthGuard)
    @Get("available-for-promoters")
    @ApiOperation({ summary: 'Get establishments available for promoters' })
    @ApiResponse({ status: 200, description: 'Available establishments retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
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
    @ApiOperation({ summary: 'Search establishments for promoters' })
    @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
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