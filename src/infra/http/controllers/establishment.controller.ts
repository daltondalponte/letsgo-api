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
import { EnsureProfessionalUser } from '../auth/guards/ensure-professional-user.guard';

@ApiTags("Estabelecimento")
@Controller("establishment")
export class EstablishmentController {

    constructor(
        private createEstablishment: CreateEstablishment,
        private updateEstablishmentPhoto: UpdateEstablishmentPhoto,
        private findManyByUser: FindEstablishmentByUserUid,
        private findAllEstablishments: FindAllEstablishments
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post("create")
    async create(@Request() req, @Body() body: EstablishmentBody) {
        const { userId: useruid } = req.user

        const { address, photos, coordinates, name } = body

        const { establishment } = await this.createEstablishment.execute(
            {
                userOwnerUid: useruid,
                address,
                photos,
                coordinates,
                name
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
}