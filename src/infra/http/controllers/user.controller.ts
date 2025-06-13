import { Body, Request, Controller, Post, UseGuards, Delete, Param, UnauthorizedException, Put, Get, Req, BadRequestException } from "@nestjs/common";
import { UserViewModel } from "../view-models/user/user-view-model";
import { UserBody } from "../dtos/user/create-user-body";
import { CreateUser } from "@application/user/use-cases/create-user";
import { CreateTicketTaker } from "@application/ticketTaker/use-cases/create-ticket-taker";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { FindTicketTakerById } from "@application/ticketTaker/use-cases/find-by-id";
import { DeleteTicketTaker } from "@application/ticketTaker/use-cases/delete-ticket-taker";
import { DeleteUserById } from "@application/user/use-cases/delete-user-by-id";
import { ApiTags } from '@nestjs/swagger';
import { CreateEstablishment } from "@application/establishment/use-cases/create-establishment";
import { EstablishmentBody } from "../dtos/establishment/create-establishment-body";
import { SaveUser } from "@application/user/use-cases/save-user";
import { FindTicketsTakerByOwner } from "@application/ticketTaker/use-cases/find-many-by-owner";
import { UpdateUSer } from "@application/user/use-cases/update-user";
import { FindAllProfessionals } from "@application/user/use-cases/find-all-professionals";
import { EstablishmentViewModel } from "../view-models/establishment/establishment-view-model";
import { UpdateProfessional } from "@application/user/use-cases/update-professional-user";
import { StripeService } from "@infra/payment/stripe.service";
import { FindUserById } from "@application/user/use-cases/find-user-by-id";
import { SaveUserDeviceToken } from "@application/user/use-cases/upsert-device-token";
import { FindAllCustomers } from "@application/user/use-cases/find-all-customers";

@ApiTags("Usuário")
@Controller('user')
export class UserController {
    constructor(
        private findTicketTakerById: FindTicketTakerById,
        private findAllProfessionals: FindAllProfessionals,
        private findAllCustomers: FindAllCustomers,
        private findTicketTakersByUserId: FindTicketsTakerByOwner,
        private deleteUserById: DeleteUserById,
        private deleteTicketTaker: DeleteTicketTaker,
        private createUser: CreateUser,
        private updateUSer: UpdateUSer,
        private findUserById: FindUserById,
        private createTicketTaker: CreateTicketTaker,
        private saveUser: SaveUser,
        private updateUserProfessional: UpdateProfessional,
        private createEstablishment: CreateEstablishment,
        private stripeService: StripeService,
        private saveUserDeviceToken: SaveUserDeviceToken
    ) { }

    @Post('create')
    async create(@Body() body: UserBody) {
        const { email, name, password, address, avatar, document, type, isOwnerOfEstablishment } = body

        const { user } = await this.createUser.execute({
            email,
            name,
            password,
            address,
            avatar,
            document,
            isOwnerOfEstablishment,
            type
        })

        return { user: UserViewModel.toHTTP(user) }
    }

    @Post('createProfessional')
    async createProfessional(@Body() body: UserBody & { establishment: EstablishmentBody }) {
        const {
            email,
            name,
            password,
            address,
            avatar,
            document,
            type,
            isOwnerOfEstablishment,
            establishment
        } = body

        const { user } = await this.createUser.execute({
            email,
            name,
            password,
            address,
            avatar,
            document,
            isOwnerOfEstablishment,
            type
        })

        if (isOwnerOfEstablishment) {
            const { address, coordinates, name } = establishment

            await this.createEstablishment.execute(
                {
                    userOwnerUid: user.id,
                    address,
                    coordinates,
                    name
                }
            )
        }

        const stripAccount = await this.stripeService.createConnectAccount(email).catch(console.error)

        if (stripAccount) {
            await this.updateUserProfessional.execute({
                data: {
                    stripeAccountId: stripAccount?.id,
                },
                uid: user.uid
            }).catch(console.error)
        }

        return { user: UserViewModel.toHTTP(user) }
    }

    @UseGuards(JwtAuthGuard)
    @Get('stripe-account-link')
    async stripeAccountLink(@Req() req) {
        const { userId: useruid, role } = req.user

        if (role !== "PROFESSIONAL") throw new UnauthorizedException("Não permitido")

        const { user } = await this.findUserById.execute({ id: useruid })

        if (!user || !user?.stripeAccountId) throw new BadRequestException("Não encontrado, faça login novamente")
        const account = await this.stripeService.retrieveAccount(user.stripeAccountId)

        if (account.charges_enabled) {
            return { message: "Cadastro completo" }
        }

        const accountLink = await this.stripeService.createAccountLink(user.stripeAccountId)

        return { ...accountLink }
    }

    @UseGuards(JwtAuthGuard)
    @Get('stripe-account-charges')
    async stripeAccountCharges(@Req() req) {
        const { userId: useruid, role } = req.user

        if (role !== "PROFESSIONAL") throw new UnauthorizedException("Não permitido")

        const { user } = await this.findUserById.execute({ id: useruid })

        if (!user) throw new BadRequestException("Não encontrado")

        const accountLink = await this.stripeService.retrieveAccount(user.stripeAccountId)

        return { ...accountLink }
    }

    @UseGuards(JwtAuthGuard)
    @Post('create/ticket-taker')
    async createTaker(@Request() req, @Body() body: any) {
        const { userId: useruid, role } = req.user

        if (role !== 'PROFESSIONAL') {
            throw new UnauthorizedException("Não permitido.")
        }

        const { email, name } = body

        const { user } = await this.createTicketTaker.execute({
            userOwnerUid: useruid,
            email,
            name
        })

        return { user: UserViewModel.toHTTP(user) }
    }

    @UseGuards(JwtAuthGuard)
    @Get('find/ticket-taker')
    async findTakers(@Request() req) {
        const { userId, role } = req.user

        if (role !== 'PROFESSIONAL') {
            throw new UnauthorizedException("Não permitido.")
        }

        const { users } = await this.findTicketTakersByUserId.execute({ userOwnerUid: userId })

        return { users: users.map(UserViewModel.toHTTP) }
    }

    @UseGuards(JwtAuthGuard)
    @Get('find/professionals')
    async findProfessionals(@Request() req) {
        const { userId } = req.user

        const { userData } = await this.findAllProfessionals.execute()

        return {
            users: userData.map(u => {
                return {
                    user: UserViewModel.toHTTP(u.user),
                    establishment: EstablishmentViewModel.toHTTP(u.establishment)
                }
            })
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('find/customers')
    async findCustomers(@Request() req) {
        const { userId } = req.user

        const { userData } = await this.findAllCustomers.execute()

        return {
            users: userData.map(u => {
                return {
                    user: UserViewModel.toHTTP(u.user),
                    establishment: EstablishmentViewModel.toHTTP(u.establishment)
                }
            })
        }
    }

    @UseGuards(JwtAuthGuard)
    @Put('update/ticket-taker')
    async updateTaker(@Request() req, @Body() body: any) {
        const { userId } = req.user
        const { name, email, id } = body

        const { users } = await this.findTicketTakersByUserId.execute({ userOwnerUid: userId })

        const user = users.find(t => t.id === id)

        if (!user) throw new UnauthorizedException("Não permitido.")

        await this.updateUSer.execute({
            name,
            email,
            id
        })

        return { message: 'sucesso' }
    }

    @UseGuards(JwtAuthGuard)
    @Put('update/device-token')
    async updateDeviceToken(@Request() req) {
        const { userId } = req.user
        const { deviceToken } = req.query

        await this.saveUserDeviceToken.execute({
            uid: userId,
            deviceToken
        })

        return { message: 'sucesso' }
    }


    @UseGuards(JwtAuthGuard)
    @Put('update/professionals/:id')
    async updateProfessional(@Param("id") id, @Request() req, @Body() body) {
        const { userId } = req.user
        const { state } = body
        await this.updateUserProfessional.execute({
            data: {
                isActive: state,
            },
            uid: id
        })

        return { message: 'sucesso' }
    }

    @UseGuards(JwtAuthGuard)
    @Put('update')
    async update(@Request() req, @Body() body: any) {
        const { userId } = req.user
        const { name, avatar, document } = body

        await this.saveUser.execute({
            uid: userId,
            name,
            avatar,
            document
        })

        return { message: 'sucesso' }
    }

    @UseGuards(JwtAuthGuard)
    @Get('paymentMethods')
    async findPaymentMethods(@Request() req) {
        const { userId } = req.user
        const { customerId } = req.query
        const { user } = await this.findUserById.execute({ id: userId })

        if (user.stripeCustomerId !== customerId) {
            throw new UnauthorizedException("Não permitido!")
        }

        const paymentMethods = await this.stripeService.retrievePaymentMethods(customerId)

        return paymentMethods
    }

    @UseGuards(JwtAuthGuard)
    @Put('paymentMethods')
    async detachPaymentMethod(@Request() req) {
        const { userId } = req.user
        const { paymentMethodId } = req.query
        const paymentMethods = await this.stripeService.detachPaymentMethod(paymentMethodId)

        return paymentMethods
    }

    @UseGuards(JwtAuthGuard)
    @Delete('delete/ticket-taker/:id')
    async deleteTaker(@Param('id') id, @Request() req) {
        const { userId: userOwnerUid } = req.user

        const { users } = await this.findTicketTakersByUserId.execute({ userOwnerUid })

        const user = users.find(u => u.id === id)

        const { ticketTaker } = await this.findTicketTakerById.execute({ id })

        if (!user) {
            throw new UnauthorizedException("Não permitido.")
        }

        await this.deleteTicketTaker.execute({ id: ticketTaker.id })
        await this.deleteUserById.execute({
            id: user.id
        })

        return { message: 'sucesso' }

    }

}