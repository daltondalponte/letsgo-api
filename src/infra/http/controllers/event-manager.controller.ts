import { Controller, Body, UseGuards, Post, Get, Request, Put, Param, Delete, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
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

@ApiTags("Event Manager")
@Controller("event-manager")
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
    @Post("create")
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
                throw new BadRequestException('Evento não encontrado');
            }

            // Verificar se o usuário que está tentando vincular é owner do estabelecimento
            if (event.establishmentId) {
                const establishment = await this.prisma.establishment.findUnique({
                    where: { id: event.establishmentId }
                });
                
                if (establishment && establishment.userOwnerUid === useruid) {
                    // Se é owner do estabelecimento, verificar se o evento é de um promoter
                    if (event.user.type === 'PROFESSIONAL_PROMOTER') {
                        throw new BadRequestException('Owners não podem vincular recepcionistas a eventos de promoters. Apenas o promoter pode gerenciar seus próprios eventos.');
                    }
                }
            }

            // Buscar o usuário pelo userUid (uid) para validar o tipo
            const { user } = await this.findUserById.execute({ id: userUid });
            if (!user) {
                throw new BadRequestException('Usuário não encontrado');
            }
            if (user.type !== 'TICKETTAKER') {
                throw new BadRequestException('Apenas usuários do tipo RECEPCIONISTA podem ser vinculados como validadores de ingressos.');
            }

            // Usar o userUid diretamente para vincular o recepcionista ao evento
            const { eventManager } = await this.createEventManager.execute({
                eventId,
                recursos: recursos || ['TICKETINSERT', 'TICKETUPDATE', 'TICKETDELETE'],
                useruid: userUid
            });

            return { 
                eventManager: EventManagerViewModel.toHTTP(eventManager),
                message: "Recepcionista vinculado com sucesso"
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
                'Erro interno do servidor ao vincular recepcionista',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get("find-by-event/:eventId")
    async findByEventId(@Param("eventId") eventId: string, @Request() req) {
        const managers = await this.findEventManagerByEventId.execute({ eventId });

        return {
            managers: managers.map(m => ({
                ...EventManagerViewModel.toHTTP(m.eventManager),
                user: {
                    id: m.user.id,
                    name: m.user.name,
                    email: m.user.email
                }
            }))
        };
    }

    @UseGuards(JwtAuthGuard, EnsureProfessionalUser)
    @Delete("delete/:id")
    async delete(@Param("id") id: string, @Request() req) {
        // Buscar o event manager para obter eventId e useruid
        const { eventManager } = await this.findEventManagerById.execute({ id });
        
        await this.deleteEventManager.execute({
            eventId: eventManager.eventId,
            useruid: eventManager.useruid
        });

        return { message: "Administrador removido com sucesso" };
    }

    @UseGuards(JwtAuthGuard, EnsureProfessionalUser)
    @Put("update/:id")
    async update(@Param("id") id: string, @Request() req, @Body() body: any) {
        const { recursos } = body;

        const { eventManager } = await this.updateEventManager.execute({
            id,
            recursos
        });

        return { eventManager: EventManagerViewModel.toHTTP(eventManager) };
    }

    @UseGuards(JwtAuthGuard, EnsureProfessionalUser)
    @Put("update-resources/:eventId")
    async updateResourcesForEvent(@Param("eventId") eventId: string, @Request() req) {
        try {
            // Buscar todos os event managers para este evento
            const managers = await this.findEventManagerByEventId.execute({ eventId });
            
            // Atualizar recursos para todos os recepcionistas do evento
            const updatePromises = managers.map(manager => 
                this.updateEventManager.execute({
                    id: manager.eventManager.id,
                    recursos: ['TICKETINSERT', 'TICKETUPDATE', 'TICKETDELETE']
                })
            );
            
            await Promise.all(updatePromises);
            
            return { 
                message: "Recursos atualizados com sucesso para todos os recepcionistas do evento",
                updatedCount: managers.length
            };
        } catch (error) {
            throw new HttpException(
                'Erro ao atualizar recursos dos recepcionistas',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
