import { Controller, Body, UseGuards, Post, Get, Request, Put, Param, Delete, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateEventManager } from '@application/event-manager/use-cases/create-event-manager';
import { FindEventManagerByEventId } from '@application/event-manager/use-cases/find-event-manager-by-eventid';
import { FindEventManagerById } from '@application/event-manager/use-cases/find-event-manager-by-id';
import { DeleteEventManager } from '@application/event-manager/use-cases/delete-event-manager';
import { UpdateEventManager } from '@application/event-manager/use-cases/update-event-manager';
import { EventManagerViewModel } from '../view-models/event-manager/event-manager-view-model';
import { EnsureProfessionalUser } from '../auth/guards/ensure-professional-user.guard';
import { EnsureOwnerEvent } from '../auth/guards/ensure-owner-event.guard';
import { FindUserByEmail } from '@application/user/use-cases/find-user-by-email';
import { CreateUser } from '@application/user/use-cases/create-user';
import { User } from '@application/user/entity/User';
import { FindUserById } from '@application/user/use-cases/find-user-by-id';
import { PrismaService } from '@infra/database/prisma/prisma.service';

@ApiTags("Event Managers")
@Controller("event-managers")
export class EventManagerController {

    constructor(
        private createEventManager: CreateEventManager,
        private findEventManagerByEventId: FindEventManagerByEventId,
        private findEventManagerById: FindEventManagerById,
        private deleteEventManager: DeleteEventManager,
        private updateEventManager: UpdateEventManager,
        private findUserByEmail: FindUserByEmail,
        private createUser: CreateUser,
        private findUserById: FindUserById,
        private prisma: PrismaService
    ) { }

    @UseGuards(JwtAuthGuard, EnsureProfessionalUser)
    @Post()
    @ApiOperation({ summary: 'Create event manager (link receptionist to event)' })
    @ApiBody({ 
        schema: {
            type: 'object',
            properties: {
                userUid: { type: 'string' },
                eventId: { type: 'string' },
                recursos: { 
                    type: 'array', 
                    items: { type: 'string' },
                    default: ['TICKETINSERT', 'TICKETUPDATE', 'TICKETDELETE']
                }
            },
            required: ['userUid', 'eventId']
        }
    })
    @ApiResponse({ status: 201, description: 'Event manager created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async create(@Request() req, @Body() body: any) {
        try {
            const { userId: useruid } = req.user;
            const { userUid, eventId, recursos } = body;

            // Buscar o evento para verificar se é de um promoter
            const event = await this.prisma.event.findUnique({
                where: { id: eventId },
                include: { user: true }
            });

            if (!event) {
                throw new BadRequestException('Event not found');
            }

            // Verificar se o usuário que está tentando vincular é owner do estabelecimento
            if (event.establishmentId) {
                const establishment = await this.prisma.establishment.findUnique({
                    where: { id: event.establishmentId }
                });
                
                if (establishment && establishment.userOwnerUid === useruid) {
                    // Se é owner do estabelecimento, verificar se o evento é de um promoter
                    if (event.user.type === 'PROFESSIONAL_PROMOTER') {
                        throw new BadRequestException('Owners cannot link receptionists to promoter events. Only the promoter can manage their own events.');
                    }
                }
            }

            // Buscar o usuário pelo userUid (uid) para validar o tipo
            const { user } = await this.findUserById.execute({ id: userUid });
            if (!user) {
                throw new BadRequestException('User not found');
            }
            if (user.type !== 'TICKETTAKER') {
                throw new BadRequestException('Only TICKETTAKER users can be linked as ticket validators.');
            }

            // Usar o userUid diretamente para vincular o recepcionista ao evento
            const eventManager = await this.createEventManager.execute({
                eventId,
                recursos: recursos || ['TICKETINSERT', 'TICKETUPDATE', 'TICKETDELETE'],
                useruid: userUid
            });

            return { 
                eventManager: EventManagerViewModel.toHTTP(eventManager),
                message: "Receptionist linked successfully"
            };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            
            if (error instanceof HttpException) {
                throw error;
            }
            
            // Para outros erros, retornar erro genérico
            throw new HttpException(
                'Internal server error while linking receptionist',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    @ApiOperation({ summary: 'Get event managers by event ID' })
    @ApiResponse({ status: 200, description: 'Event managers retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findByEventId(@Request() req, @Param() params: any) {
        const { eventId } = req.query;
        
        if (!eventId) {
            throw new BadRequestException('Event ID is required');
        }

        const managers = await this.findEventManagerByEventId.execute({ eventId });

        // Buscar informações dos usuários separadamente
        const managersWithUsers = await Promise.all(
            managers.map(async (manager) => {
                const userResponse = await this.findUserById.execute({ id: manager.useruid });
                return {
                    ...EventManagerViewModel.toHTTP(manager),
                    user: {
                        id: manager.useruid,
                        name: userResponse?.user?.name || '',
                        email: userResponse?.user?.email || ''
                    }
                };
            })
        );

        return {
            managers: managersWithUsers
        };
    }

    @UseGuards(JwtAuthGuard, EnsureProfessionalUser)
    @Delete(':id')
    @ApiOperation({ summary: 'Delete event manager (unlink receptionist from event)' })
    @ApiResponse({ status: 200, description: 'Event manager deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Event manager not found' })
    async delete(@Param("id") id: string, @Request() req) {
        // Buscar o event manager para obter eventId e useruid
        const eventManager = await this.findEventManagerById.execute({ id });
        
        await this.deleteEventManager.execute({
            eventId: eventManager.eventId,
            useruid: eventManager.useruid
        });

        return { message: "Event manager removed successfully" };
    }

    @UseGuards(JwtAuthGuard, EnsureProfessionalUser)
    @Put(':id')
    @ApiOperation({ summary: 'Update event manager resources' })
    @ApiResponse({ status: 200, description: 'Event manager updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Event manager not found' })
    async update(@Param("id") id: string, @Request() req, @Body() body: any) {
        const { recursos } = body;

        const eventManager = await this.updateEventManager.execute({
            id,
            recursos
        });

        return { eventManager: EventManagerViewModel.toHTTP(eventManager) };
    }

    @UseGuards(JwtAuthGuard, EnsureProfessionalUser)
    @Put('event/:eventId/resources')
    @ApiOperation({ summary: 'Update resources for all event managers of an event' })
    @ApiResponse({ status: 200, description: 'Resources updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async updateResourcesForEvent(@Param("eventId") eventId: string, @Request() req) {
        try {
            // Buscar todos os event managers para este evento
            const managers = await this.findEventManagerByEventId.execute({ eventId });
            
            // Atualizar recursos para todos os recepcionistas do evento
            const updatePromises = managers.map(manager => 
                this.updateEventManager.execute({
                    id: manager.id,
                    recursos: ['TICKETINSERT', 'TICKETUPDATE', 'TICKETDELETE']
                })
            );
            
            await Promise.all(updatePromises);
            
            return { 
                message: "Resources updated successfully for all event receptionists",
                updatedCount: managers.length
            };
        } catch (error) {
            throw new HttpException(
                'Error updating receptionist resources',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
