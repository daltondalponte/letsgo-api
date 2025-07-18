import { Body, Request, Controller, Post, UseGuards, Delete, Param, UnauthorizedException, Put, Get, Req, BadRequestException } from "@nestjs/common";
import { UserViewModel } from "../view-models/user/user-view-model";
import { UserBody } from "../dtos/user/create-user-body";
import { CreateUser } from "@application/user/use-cases/create-user";
import { CreateTicketTaker } from "@application/ticketTaker/use-cases/create-ticket-taker";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { FindTicketTakerById } from "@application/ticketTaker/use-cases/find-by-id";
import { DeleteTicketTaker } from "@application/ticketTaker/use-cases/delete-ticket-taker";
import { DeleteUserById } from "@application/user/use-cases/delete-user-by-id";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CreateEstablishment } from "@application/establishment/use-cases/create-establishment";
import { EstablishmentBody } from "../dtos/establishment/create-establishment-body";
import { SaveUser } from "@application/user/use-cases/save-user";
import { FindTicketsTakerByOwner } from "@application/ticketTaker/use-cases/find-many-by-owner";
import { UpdateUSer } from "@application/user/use-cases/update-user";
import { FindAllProfessionals } from "@application/user/use-cases/find-all-professionals";
import { EstablishmentViewModel } from "../view-models/establishment/establishment-view-model";
import { UpdateProfessional } from "@application/user/use-cases/update-professional-user";
import { SaveUserDeviceToken } from "@application/user/use-cases/upsert-device-token";
import { FindAllCustomers } from "@application/user/use-cases/find-all-customers";
import { FindUserById } from "@application/user/use-cases/find-user-by-id";
import { CreateProfessionalBody } from "../dtos/user/create-professional-body";
import { CreateTicketTakerBody } from "../dtos/user/create-ticket-taker-body";
import { UpdateTicketTakerBody } from "../dtos/user/update-ticket-taker-body";
import { UpdateUserBody } from "../dtos/user/update-user-body";
import { UpdateProfessionalBody } from "../dtos/user/update-professional-body";
import { UpdateDeviceTokenBody } from "../dtos/user/update-device-token-body";

@ApiTags("Users")
@Controller('users')
export class UserController {
    constructor(
        private findTicketTakerById: FindTicketTakerById,
        private findAllProfessionals: FindAllProfessionals,
        private findAllCustomers: FindAllCustomers,
        private findTicketTakersByUserId: FindTicketsTakerByOwner,
        private deleteUserById: DeleteUserById,
        private deleteTicketTakerUseCase: DeleteTicketTaker,
        private createUser: CreateUser,
        private updateUSer: UpdateUSer,
        private findUserById: FindUserById,
        private createTicketTakerUseCase: CreateTicketTaker,
        private saveUser: SaveUser,
        private updateUserProfessional: UpdateProfessional,
        private createEstablishment: CreateEstablishment,
        private saveUserDeviceToken: SaveUserDeviceToken
    ) { }

    @Post()
    @ApiOperation({ 
        summary: 'Create new user',
        description: 'Creates a new user account with the provided information. Supports different user types: PERSONAL, PROFESSIONAL_OWNER, PROFESSIONAL_PROMOTER, TICKETTAKER'
    })
    @ApiBody({ 
        type: UserBody,
        description: 'User registration data',
        examples: {
            personal: {
                summary: 'Personal User',
                value: {
                    name: 'João Silva',
                    email: 'joao@email.com',
                    password: 'senha123',
                    type: 'PERSONAL',
                    phone: '11999999999'
                }
            },
            professional: {
                summary: 'Professional User',
                value: {
                    name: 'Maria Santos',
                    email: 'maria@estabelecimento.com',
                    password: 'senha123',
                    type: 'PROFESSIONAL_OWNER',
                    isOwnerOfEstablishment: true,
                    phone: '11988888888'
                }
            }
        }
    })
    @ApiResponse({ 
        status: 201, 
        description: 'User created successfully',
        schema: {
            type: 'object',
            properties: {
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        type: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Invalid data or email already registered' })
    async create(@Body() body: UserBody) {
        const { email, name, password, address, avatar, document, type, isOwnerOfEstablishment, phone, birthDate } = body

        const { user } = await this.createUser.execute({
            email,
            name,
            password,
            address,
            avatar,
            document,
            isOwnerOfEstablishment,
            phone,
            birthDate,
            type
        })

        return { user: UserViewModel.toHTTP(user) }
    }

    @Post('professional')
    @ApiOperation({ summary: 'Create professional user with establishment' })
    @ApiBody({ type: CreateProfessionalBody })
    @ApiResponse({ status: 201, description: 'Professional user created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid data or email already registered' })
    async createProfessional(@Body() body: CreateProfessionalBody) {
        const {
            email,
            name,
            password,
            address,
            avatar,
            document,
            type,
            isOwnerOfEstablishment,
            phone,
            birthDate,
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
            phone,
            birthDate,
            type
        })

        if (isOwnerOfEstablishment && establishment) {
            const { address, coordinates, name, description, contactPhone, website, socialMedia } = establishment

            await this.createEstablishment.execute(
                {
                    userOwnerUid: user.id,
                    address,
                    coordinates,
                    name,
                    description,
                    contactPhone,
                    website,
                    socialMedia
                }
            )
        }

        return { user: UserViewModel.toHTTP(user) }
    }

    @UseGuards(JwtAuthGuard)
    @Post('ticket-taker')
    @ApiOperation({ summary: 'Create ticket taker user' })
    @ApiBody({ type: CreateTicketTakerBody })
    @ApiResponse({ status: 201, description: 'Ticket taker created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async createTicketTaker(@Request() req, @Body() body: CreateTicketTakerBody) {
        const { userId: useruid } = req.user;
        const { email, name } = body;

        const { user } = await this.createUser.execute({
            email,
            name,
            password: '', // Será gerado automaticamente
            address: '',
            avatar: '',
            document: '',
            isOwnerOfEstablishment: false,
            phone: '',
            birthDate: new Date(),
            type: 'TICKETTAKER'
        });

        const { user: ticketTakerUser } = await this.createTicketTakerUseCase.execute({
            userOwnerUid: useruid,
            email,
            name
        });

        return { 
            user: UserViewModel.toHTTP(ticketTakerUser)
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get('professionals')
    @ApiOperation({ summary: 'Get all professional users' })
    @ApiResponse({ status: 200, description: 'Professional users retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getProfessionals(@Request() req) {
        const { type } = req.user;

        if (type !== "MASTER") {
            throw new UnauthorizedException("Access denied. Only Master users can access this information.");
        }

        const { userData } = await this.findAllProfessionals.execute();

        return {
            professionals: userData.map(data => ({
                user: UserViewModel.toHTTP(data.user),
                establishment: data.establishment ? EstablishmentViewModel.toHTTP(data.establishment) : null
            }))
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get('customers')
    @ApiOperation({ summary: 'Get all customer users' })
    @ApiResponse({ status: 200, description: 'Customer users retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getCustomers(@Request() req) {
        const { type } = req.user;

        if (type !== "MASTER") {
            throw new UnauthorizedException("Access denied. Only Master users can access this information.");
        }

        const { userData } = await this.findAllCustomers.execute();

        return {
            customers: userData.map(data => UserViewModel.toHTTP(data.user))
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get('ticket-takers')
    @ApiOperation({ summary: 'Get ticket takers by owner' })
    @ApiResponse({ status: 200, description: 'Ticket takers retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getTicketTakers(@Request() req) {
        const { userId: useruid } = req.user;

        const { users } = await this.findTicketTakersByUserId.execute({ userOwnerUid: useruid });

        return {
            ticketTakers: users.map(user => UserViewModel.toHTTP(user))
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiResponse({ status: 200, description: 'User retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async findById(@Param('id') id: string, @Request() req) {
        const { type } = req.user;

        if (type !== "MASTER") {
            throw new UnauthorizedException("Access denied. Only Master users can access this information.");
        }

        const { user } = await this.findUserById.execute({ id });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        return { user: UserViewModel.toHTTP(user) };
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    @ApiOperation({ summary: 'Update user' })
    @ApiBody({ type: UpdateUserBody })
    @ApiResponse({ status: 200, description: 'User updated successfully' })
    @ApiResponse({ status: 400, description: 'Invalid data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async update(@Param('id') id: string, @Request() req, @Body() body: UpdateUserBody) {
        const { userId: useruid } = req.user;

        // Verificar se o usuário está tentando atualizar a si mesmo
        if (id !== useruid) {
            throw new UnauthorizedException("You can only update your own profile");
        }

        await this.updateUSer.execute({
            id: id,
            name: body.name || '',
            email: '' // UpdateUserBody não tem email, usar valor padrão
        });

        return { message: 'User updated successfully' };
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id/professional')
    @ApiOperation({ summary: 'Update professional user' })
    @ApiBody({ type: UpdateProfessionalBody })
    @ApiResponse({ status: 200, description: 'Professional user updated successfully' })
    @ApiResponse({ status: 400, description: 'Invalid data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async updateProfessional(@Param('id') id: string, @Request() req, @Body() body: UpdateProfessionalBody) {
        const { type } = req.user;

        if (type !== "MASTER") {
            throw new UnauthorizedException("Access denied. Only Master users can update professional users.");
        }

        const { user } = await this.updateUserProfessional.execute({
            uid: id,
            data: body
        });

        return { user: UserViewModel.toHTTP(user) };
    }

    @UseGuards(JwtAuthGuard)
    @Put('ticket-taker/:id')
    @ApiOperation({ summary: 'Update ticket taker' })
    @ApiBody({ type: UpdateTicketTakerBody })
    @ApiResponse({ status: 200, description: 'Ticket taker updated successfully' })
    @ApiResponse({ status: 400, description: 'Invalid data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async updateTicketTaker(@Param('id') id: string, @Request() req, @Body() body: UpdateTicketTakerBody) {
        const { userId: useruid } = req.user;

        // Verificar se o usuário é o owner do ticket taker
        const { ticketTaker } = await this.findTicketTakerById.execute({ id });
        if (!ticketTaker || ticketTaker.userOwnerUid !== useruid) {
            throw new UnauthorizedException("You can only update your own ticket takers");
        }

        // TODO: Implementar atualização do ticket taker
        return { message: 'Ticket taker updated successfully' };
    }

    @UseGuards(JwtAuthGuard)
    @Put('device-token')
    @ApiOperation({ summary: 'Update user device token' })
    @ApiBody({ type: UpdateDeviceTokenBody })
    @ApiResponse({ status: 200, description: 'Device token updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async updateDeviceToken(@Request() req, @Body() body: UpdateDeviceTokenBody) {
        const { userId: useruid } = req.user;
        const { deviceToken } = body;

        await this.saveUserDeviceToken.execute({
            uid: useruid,
            deviceToken
        });

        return { message: 'Device token updated successfully' };
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @ApiOperation({ summary: 'Delete user' })
    @ApiResponse({ status: 200, description: 'User deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async delete(@Param('id') id: string, @Request() req) {
        const { type } = req.user;

        if (type !== "MASTER") {
            throw new UnauthorizedException("Access denied. Only Master users can delete users.");
        }

        await this.deleteUserById.execute({ id });

        return { message: 'User deleted successfully' };
    }

    @UseGuards(JwtAuthGuard)
    @Delete('ticket-taker/:id')
    @ApiOperation({ summary: 'Delete ticket taker' })
    @ApiResponse({ status: 200, description: 'Ticket taker deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Ticket taker not found' })
    async deleteTicketTaker(@Param('id') id: string, @Request() req) {
        const { userId: useruid } = req.user;

        // Verificar se o usuário é o owner do ticket taker
        const { ticketTaker } = await this.findTicketTakerById.execute({ id });
        if (!ticketTaker || ticketTaker.userOwnerUid !== useruid) {
            throw new UnauthorizedException("You can only delete your own ticket takers");
        }

        await this.deleteTicketTakerUseCase.execute({ id });

        return { message: 'Ticket taker deleted successfully' };
    }
}