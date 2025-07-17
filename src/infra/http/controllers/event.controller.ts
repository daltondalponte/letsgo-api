import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateEvent } from "@application/event/use-cases/create-event";
import { FindEventsByUserUidOrEstablishmentId } from "@application/event/use-cases/find-many-by-user";
import { FindEventById } from "@application/event/use-cases/find-event-by-id";
import { UpdateEvent } from "@application/event/use-cases/update-event";
import { DeleteEvent } from "@application/event/use-cases/delete-event";
import { FindPendingApprovals } from "@application/event/use-cases/find-pending-approvals";
import { ApproveEvent } from "@application/event/use-cases/approve-event";
import { RejectEvent } from "@application/event/use-cases/reject-event";
import { FindEstablishmentById } from "@application/establishment/use-cases/find-many-by-id";
import { CreateEventBody } from "../dtos/event/create-event-body";
import { CreateEventWithImagesBody } from "../dtos/event/create-event-with-images-body";
import { UpdateEventBody } from "../dtos/event/update-event-body";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { EnsureProfessionalUser } from "../auth/guards/ensure-professional-user.guard";
import { EventViewModel } from "../view-models/event/event-view-model";
import { PrismaService } from "@infra/database/prisma/prisma.service";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

@ApiTags("Events")
@Controller("events")
export class EventController {

    // Configurações do Cloudflare R2
    private readonly CLOUDFLARE_CONFIG = {
        accountId: 'd0966b8c9dc94cd73c466c563dab7a66',
        bucketName: 'letsgo-images',
        endpoint: 'https://d0966b8c9dc94cd73c466c563dab7a66.r2.cloudflarestorage.com',
        accessKeyId: '496297cfaacf1a28a51dcb803db187f0',
        secretAccessKey: '012d556a5a658135e4529d2e9794b3be4aa47ef7a892cc3d825aed68112afa7d',
    };

    private readonly s3Client = new S3Client({
        region: 'auto',
        endpoint: this.CLOUDFLARE_CONFIG.endpoint,
        credentials: {
            accessKeyId: this.CLOUDFLARE_CONFIG.accessKeyId,
            secretAccessKey: this.CLOUDFLARE_CONFIG.secretAccessKey,
        },
    });

    constructor(
        private createEvent: CreateEvent,
        private findEventsByUserUidOrEstablishmentId: FindEventsByUserUidOrEstablishmentId,
        private findEventById: FindEventById,
        private updateEvent: UpdateEvent,
        private deleteEvent: DeleteEvent,
        private findPendingApprovals: FindPendingApprovals,
        private approveEventUseCase: ApproveEvent,
        private rejectEventUseCase: RejectEvent,
        private findEstablishmentById: FindEstablishmentById,
        private prisma: PrismaService
    ) { }

    @UseGuards(JwtAuthGuard, EnsureProfessionalUser)
    @Post()
    @ApiOperation({ summary: 'Create new event' })
    @ApiBody({ type: CreateEventBody })
    @ApiResponse({ status: 201, description: 'Event created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid data or time conflict' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async create(@Request() req, @Body() body: CreateEventBody) {
        const { userId: useruid, type } = req.user

        let { name, description, dateTimestamp, endTimestamp, duration, establishmentId, address, coordinates_event, photos = [], tickets = [] } = body

        // Validar se a data não é passada
        const eventDate = new Date(dateTimestamp);
        const now = new Date();
        if (eventDate <= now) {
            throw new BadRequestException('Não é possível criar eventos em datas passadas ou na data atual. A data do evento deve ser futura.');
        }

        // Se duration for informado, calcular endTimestamp
        if (duration) {
            const dur = Number(duration);
            if (isNaN(dur) || dur < 1) {
                throw new BadRequestException('A duração do evento deve ser de pelo menos 1 hora.');
            }
            const endDate = new Date(eventDate.getTime() + dur * 60 * 60 * 1000);
            endTimestamp = endDate.toISOString();
        }

        // Garantir formato ISO-8601 válido para o Prisma
        let formattedDateTimestamp = dateTimestamp;
        if (!formattedDateTimestamp.endsWith('Z')) {
            formattedDateTimestamp += 'Z';
        }

        let formattedEndTimestamp = endTimestamp;
        if (endTimestamp && !formattedEndTimestamp.endsWith('Z')) {
            formattedEndTimestamp += 'Z';
        }

        // Determinar endereço e coordenadas finais
        let finalAddress = address;
        let finalCoordinates = coordinates_event;

        // Se establishmentId for fornecido, buscar endereço e coordenadas do estabelecimento
        if (establishmentId) {
            try {
                const { establishment } = await this.findEstablishmentById.execute({ id: establishmentId });
                if (establishment) {
                    finalAddress = establishment.address || address;
                    finalCoordinates = establishment.coord || coordinates_event;
                }
            } catch (error) {
                console.error('Erro ao buscar estabelecimento:', error);
                // Continuar com os dados fornecidos
            }
        }

        // Verificar se já existe evento no mesmo horário no estabelecimento
        if (establishmentId) {
            try {
                const { events } = await this.findEventsByUserUidOrEstablishmentId.execute({ establishmentId });
                
                // Verificar se há conflito de horário
                const conflictingEvent = events.find(existingEvent => {
                    const existingDate = new Date(existingEvent.dateTimestamp);
                    const newEventDate = new Date(formattedDateTimestamp);
                    
                    // Verificar se é exatamente o mesmo horário
                    return existingDate.getTime() === newEventDate.getTime();
                });
                
                if (conflictingEvent) {
                    const eventDate = new Date(conflictingEvent.dateTimestamp);
                    const formattedDate = eventDate.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                    const formattedTime = eventDate.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    const establishmentName = conflictingEvent.establishment?.name || 'este estabelecimento';
                    
                    throw new BadRequestException(
                        `Já existe um evento agendado em ${establishmentName} para ${formattedDate} às ${formattedTime}. ` +
                        `Não é possível criar eventos simultâneos no mesmo estabelecimento. ` +
                        `Por favor, escolha uma data/hora diferente ou aguarde o evento atual terminar.`
                    );
                }
            } catch (error) {
                // Se o erro já é BadRequestException, re-throw
                if (error instanceof BadRequestException) {
                    throw error;
                }
                // Para outros erros, apenas log e continuar
                console.error('Erro ao verificar conflitos de horário:', error);
            }
        }

        // Determinar se o evento deve ser ativo baseado no tipo de usuário
        // Promoters criam eventos inativos que precisam de aprovação
        // Owners criam eventos ativos diretamente
        const isEventActive = type === 'PROFESSIONAL_OWNER';

        const { event } = await this.createEvent.execute({
            name,
            description,
            dateTimestamp: formattedDateTimestamp, // Adiciona 'Z' para o Prisma aceitar
            endTimestamp: formattedEndTimestamp, // Adiciona 'Z' para o Prisma aceitar
            establishmentId: establishmentId || null,
            address: finalAddress || null,
            coordinates_event: finalCoordinates || null,
            useruid,
            photos,
            isActive: isEventActive,
            tickets // Passar os tickets para o use case
        })

        return { event: EventViewModel.toHTTP(event) }
    }

    @UseGuards(JwtAuthGuard, EnsureProfessionalUser)
    @Post("with-images")
    @ApiOperation({ summary: 'Create event with secure image upload' })
    @ApiBody({ type: CreateEventWithImagesBody })
    @ApiResponse({ status: 201, description: 'Event created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid data or time conflict' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async createWithImages(@Request() req, @Body() body: CreateEventWithImagesBody) {
        const { userId: useruid, type } = req.user;
        const { images, ...eventData } = body;

        // Primeiro, validar o evento sem as imagens
        let { name, description, dateTimestamp, endTimestamp, duration, establishmentId, address, coordinates_event, tickets = [] } = eventData;

        // Validar se a data não é passada
        const eventDate = new Date(dateTimestamp);
        const now = new Date();
        if (eventDate <= now) {
            throw new BadRequestException('Não é possível criar eventos em datas passadas ou na data atual. A data do evento deve ser futura.');
        }

        // Se duration for informado, calcular endTimestamp
        if (duration) {
            const dur = Number(duration);
            if (isNaN(dur) || dur < 1) {
                throw new BadRequestException('A duração do evento deve ser de pelo menos 1 hora.');
            }
            const endDate = new Date(eventDate.getTime() + dur * 60 * 60 * 1000);
            endTimestamp = endDate.toISOString();
        }

        // Garantir formato ISO-8601 válido para o Prisma
        let formattedDateTimestamp = dateTimestamp;
        if (!formattedDateTimestamp.endsWith('Z')) {
            formattedDateTimestamp += 'Z';
        }

        let formattedEndTimestamp = endTimestamp;
        if (endTimestamp && !formattedEndTimestamp.endsWith('Z')) {
            formattedEndTimestamp += 'Z';
        }

        // Determinar endereço e coordenadas finais
        let finalAddress = address;
        let finalCoordinates = coordinates_event;

        // Se establishmentId for fornecido, buscar endereço e coordenadas do estabelecimento
        if (establishmentId) {
            try {
                const { establishment } = await this.findEstablishmentById.execute({ id: establishmentId });
                if (establishment) {
                    finalAddress = establishment.address || address;
                    finalCoordinates = establishment.coord || coordinates_event;
                }
            } catch (error) {
                console.error('Erro ao buscar estabelecimento:', error);
                // Continuar com os dados fornecidos
            }
        }

        // Verificar se já existe evento no mesmo horário no estabelecimento
        if (establishmentId) {
            try {
                const { events } = await this.findEventsByUserUidOrEstablishmentId.execute({ establishmentId });
                
                // Verificar se há conflito de horário
                const conflictingEvent = events.find(existingEvent => {
                    const existingDate = new Date(existingEvent.dateTimestamp);
                    const newEventDate = new Date(formattedDateTimestamp);
                    
                    // Verificar se é exatamente o mesmo horário
                    return existingDate.getTime() === newEventDate.getTime();
                });
                
                if (conflictingEvent) {
                    const eventDate = new Date(conflictingEvent.dateTimestamp);
                    const formattedDate = eventDate.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                    const formattedTime = eventDate.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    const establishmentName = conflictingEvent.establishment?.name || 'este estabelecimento';
                    
                    throw new BadRequestException(
                        `Já existe um evento agendado em ${establishmentName} para ${formattedDate} às ${formattedTime}. ` +
                        `Não é possível criar eventos simultâneos no mesmo estabelecimento. ` +
                        `Por favor, escolha uma data/hora diferente ou aguarde o evento atual terminar.`
                    );
                }
            } catch (error) {
                // Se o erro já é BadRequestException, re-throw
                if (error instanceof BadRequestException) {
                    throw error;
                }
                // Para outros erros, apenas log e continuar
                console.error('Erro ao verificar conflitos de horário:', error);
            }
        }

        // Processar imagens se fornecidas
        let processedPhotos = [];
        if (images && images.length > 0) {
            for (const imageData of images) {
                try {
                    // Decodificar base64
                    const base64Data = imageData.data.replace(/^data:image\/[a-z]+;base64,/, '');
                    const buffer = Buffer.from(base64Data, 'base64');

                    // Comprimir imagem
                    const compressedBuffer = await sharp(buffer)
                        .resize(960, 720, { 
                            fit: 'inside', 
                            withoutEnlargement: true 
                        })
                        .jpeg({ quality: 75 })
                        .toBuffer();

                    // Gerar nome único
                    const fileName = `events/${Date.now()}-${uuidv4()}.jpg`;

                    // Upload para Cloudflare R2
                    await this.s3Client.send(new PutObjectCommand({
                        Bucket: this.CLOUDFLARE_CONFIG.bucketName,
                        Key: fileName,
                        Body: compressedBuffer,
                        ContentType: 'image/jpeg',
                    }));

                    processedPhotos.push(fileName);
                } catch (error) {
                    console.error('Erro ao processar imagem:', error);
                    throw new BadRequestException('Erro ao processar uma das imagens fornecidas');
                }
            }
        }

        // Determinar se o evento deve ser ativo baseado no tipo de usuário
        // Promoters criam eventos inativos que precisam de aprovação
        // Owners criam eventos ativos diretamente
        const isEventActive = type === 'PROFESSIONAL_OWNER';

        const { event } = await this.createEvent.execute({
            name,
            description,
            dateTimestamp: formattedDateTimestamp,
            endTimestamp: formattedEndTimestamp,
            establishmentId: establishmentId || null,
            address: finalAddress || null,
            coordinates_event: finalCoordinates || null,
            useruid,
            photos: processedPhotos,
            isActive: isEventActive,
            tickets
        })

        return { event: EventViewModel.toHTTP(event) }
    }

    @Get("explore")
    @ApiOperation({ summary: 'Get events for explore page' })
    @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
    async getExploreEvents() {
        try {
            // Buscar eventos ativos e futuros (sem filtro de aprovação)
            const events = await this.prisma.event.findMany({
                where: {
                    isActive: true,
                    dateTimestamp: {
                        gte: new Date(),
                    },
                },
                include: {
                    establishment: {
                        select: {
                            id: true,
                            name: true,
                            address: true,
                            coordinates: true,
                        },
                    },
                    Ticket: {
                        select: {
                            id: true,
                            description: true,
                            price: true,
                            quantity_available: true,
                        },
                    },
                    user: {
                        select: {
                            uid: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: [
                    { dateTimestamp: 'asc' },
                    { createdAt: 'desc' },
                ],
                take: 50,
            });

            return {
                events: events.map(event => EventViewModel.toHTTP(event)),
                total: events.length,
            };
        } catch (error) {
            console.error('Erro ao buscar eventos para explore:', error);
            throw new BadRequestException('Erro ao buscar eventos');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    @ApiOperation({ summary: 'Get events by user or establishment' })
    @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findManyByUser(@Request() req) {
        const { userId: useruid, type } = req.user

        let events = [];

        if (type === 'PROFESSIONAL_PROMOTER') {
            
            // Promoters veem apenas eventos criados por eles
            const dbEvents = await this.prisma.event.findMany({
                where: {
                    useruid: useruid,
                },
                include: {
                    establishment: true,
                    user: true,
                    ManageEvents: {
                        include: {
                            user: true
                        }
                    },
                    Ticket: true
                },
                orderBy: {
                    dateTimestamp: 'desc'
                }
            });
            
            events = dbEvents;
            
        } else if (type === 'PROFESSIONAL_OWNER') {
            
            // Owners veem eventos do seu estabelecimento (criados por eles E por promoters)
            const establishments = await this.prisma.establishment.findMany({
                where: { userOwnerUid: useruid },
                select: { id: true, name: true }
            });
            
            if (establishments.length > 0) {
                const establishmentIds = establishments.map(e => e.id);
                
                // Buscar eventos dos estabelecimentos do owner
                const dbEvents = await this.prisma.event.findMany({
                    where: {
                        establishmentId: {
                            in: establishmentIds
                        }
                    },
                    include: {
                        establishment: true,
                        user: true,
                        ManageEvents: {
                            include: {
                                user: true
                            }
                        },
                        Ticket: true
                    },
                    orderBy: {
                        dateTimestamp: 'desc'
                    }
                });
                
                events = dbEvents;
                
            } else {
                events = [];
            }
        } else if (type === 'PERSONAL') {
            events = [];
        } else if (type === 'TICKETTAKER') {
            
            // TicketTakers veem apenas eventos que lhes foram atribuídos
            const dbEvents = await this.prisma.event.findMany({
                where: {
                    ManageEvents: {
                        some: {
                            useruid: useruid
                        }
                    }
                },
                include: {
                    establishment: true,
                    user: true,
                    ManageEvents: {
                        include: {
                            user: true
                        }
                    },
                    Ticket: true
                },
                orderBy: {
                    dateTimestamp: 'desc'
                }
            });
            
            events = dbEvents;
        } else {
            events = [];
        }

        return { events: events.map(EventViewModel.toHTTP) }
    }

    @Get("approved")
    @ApiOperation({ summary: 'Get all approved events (public)' })
    @ApiResponse({ status: 200, description: 'Approved events retrieved successfully' })
    async findApprovedEvents() {
        try {
            // Buscar eventos aprovados e ativos diretamente do banco
            const events = await this.prisma.event.findMany({
                where: {
                    isActive: true,
                    dateTimestamp: {
                        gte: new Date(),
                    },
                },
                include: {
                    establishment: {
                        select: {
                            id: true,
                            name: true,
                            address: true,
                            coordinates: true,
                        },
                    },
                    Ticket: {
                        select: {
                            id: true,
                            description: true,
                            price: true,
                            quantity_available: true,
                        },
                    },
                    user: {
                        select: {
                            uid: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: [
                    { dateTimestamp: 'asc' },
                    { createdAt: 'desc' },
                ],
                take: 100,
            });

            return {
                events: events.map(event => EventViewModel.toHTTP(event)),
                total: events.length,
            };
        } catch (error) {
            console.error('Erro ao buscar eventos aprovados:', error);
            throw new BadRequestException('Erro ao buscar eventos');
        }
    }

    @Get("establishment/:establishmentId")
    @ApiOperation({ summary: 'Get approved events by establishment (public)' })
    @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
    async findEventsByEstablishment(@Param("establishmentId") establishmentId: string) {
        try {
            // Buscar eventos aprovados e ativos do estabelecimento
            const events = await this.prisma.event.findMany({
                where: {
                    establishmentId: establishmentId,
                    isActive: true,
                    dateTimestamp: {
                        gte: new Date(),
                    },
                },
                include: {
                    establishment: {
                        select: {
                            id: true,
                            name: true,
                            address: true,
                            coordinates: true,
                        },
                    },
                    Ticket: {
                        select: {
                            id: true,
                            description: true,
                            price: true,
                            quantity_available: true,
                        },
                    },
                    user: {
                        select: {
                            uid: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: [
                    { dateTimestamp: 'asc' },
                    { createdAt: 'desc' },
                ],
            });

            return {
                events: events.map(event => EventViewModel.toHTTP(event)),
                total: events.length,
            };
        } catch (error) {
            console.error('Erro ao buscar eventos do estabelecimento:', error);
            throw new BadRequestException('Erro ao buscar eventos');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get("user/approved")
    @ApiOperation({ summary: 'Get approved events by user or establishment' })
    @ApiResponse({ status: 200, description: 'Approved events retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findManyByUserApproved(@Request() req) {
        const { userId: useruid, type } = req.user

        let events = [];

        if (type === 'PROFESSIONAL_PROMOTER') {
            
            // Promoters veem apenas eventos criados por eles que estão ativos
            const dbEvents = await this.prisma.event.findMany({
                where: {
                    useruid: useruid,
                    isActive: true,
                    dateTimestamp: {
                        gte: new Date()
                    }
                },
                include: {
                    establishment: true,
                    user: true,
                    ManageEvents: {
                        include: {
                            user: true
                        }
                    },
                    Ticket: true
                },
                orderBy: {
                    dateTimestamp: 'desc'
                }
            });
            
            events = dbEvents;
            
        } else if (type === 'PROFESSIONAL_OWNER') {
            
            // Owners veem eventos aprovados dos seus estabelecimentos
            const establishments = await this.prisma.establishment.findMany({
                where: { userOwnerUid: useruid },
                select: { id: true, name: true }
            });
            
            if (establishments.length > 0) {
                const establishmentIds = establishments.map(e => e.id);
                
                // Buscar eventos aprovados dos estabelecimentos do owner
                const dbEvents = await this.prisma.event.findMany({
                    where: {
                        establishmentId: {
                            in: establishmentIds
                        },
                        isActive: true,
                        dateTimestamp: {
                            gte: new Date()
                        }
                    },
                    include: {
                        establishment: true,
                        user: true,
                        ManageEvents: {
                            include: {
                                user: true
                            }
                        },
                        Ticket: true
                    },
                    orderBy: {
                        dateTimestamp: 'desc'
                    }
                });
                
                events = dbEvents;
                
            } else {
                events = [];
            }
        } else if (type === 'PERSONAL') {
            events = [];
        } else if (type === 'TICKETTAKER') {
            
            // TicketTakers veem apenas eventos aprovados que lhes foram atribuídos
            const dbEvents = await this.prisma.event.findMany({
                where: {
                    ManageEvents: {
                        some: {
                            useruid: useruid
                        }
                    },
                    isActive: true,
                    dateTimestamp: {
                        gte: new Date()
                    }
                },
                include: {
                    establishment: true,
                    user: true,
                    ManageEvents: {
                        include: {
                            user: true
                        }
                    },
                    Ticket: true
                },
                orderBy: {
                    dateTimestamp: 'desc'
                }
            });
            
            events = dbEvents;
        } else {
            events = [];
        }

        return { events: events.map(EventViewModel.toHTTP) }
    }

    @UseGuards(JwtAuthGuard)
    @Get("pending-approvals/:establishmentId")
    @ApiOperation({ summary: 'Get pending approvals for establishment' })
    @ApiResponse({ status: 200, description: 'Pending approvals retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getPendingApprovals(@Param("establishmentId") establishmentId: string, @Request() req) {
        const { type } = req.user;

        // Apenas PROFESSIONAL_OWNER pode ver aprovações pendentes
        if (type !== 'PROFESSIONAL_OWNER') {
            throw new UnauthorizedException('Apenas proprietários de estabelecimentos podem ver aprovações pendentes');
        }

        const { events } = await this.findPendingApprovals.execute({ establishmentId });

        return { events };
    }

    @UseGuards(JwtAuthGuard)
    @Get('reports/stats')
    @ApiOperation({ summary: 'Get event statistics' })
    @ApiResponse({ status: 200, description: 'Event statistics retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getEventStats(@Request() req) {
      const user = req.user;
      let events = [];

      if (user.type === 'PROFESSIONAL_PROMOTER') {
        events = await this.prisma.event.findMany({
          where: { useruid: user.userId },
          include: {
            Ticket: {
              include: { TicketSale: true }
            }
          }
        });
      } else if (user.type === 'PROFESSIONAL_OWNER') {
        const establishments = await this.prisma.establishment.findMany({
          where: { userOwnerUid: user.userId },
          select: { id: true }
        });
        const establishmentIds = establishments.map(e => e.id);
        events = await this.prisma.event.findMany({
          where: { establishmentId: { in: establishmentIds } },
          include: {
            Ticket: {
              include: { TicketSale: true }
            }
          }
        });
      }

      // Montar resposta no formato esperado
      const result = events.map(event => {
        const tickets = event.Ticket || [];
        const ticketsSold = tickets.reduce((sum, t) => sum + (t.TicketSale?.length || 0), 0);
        const ticketsAvailable = tickets.reduce((sum, t) => sum + (t.quantity_available || 0), 0);
        const totalRevenue = tickets.reduce((sum, t) => sum + (t.TicketSale?.reduce((s, sale) => s + (sale.price || 0), 0) || 0), 0);
        return {
          id: event.id,
          name: event.name,
          totalSales: ticketsSold,
          totalRevenue,
          ticketsSold,
          ticketsAvailable,
          date: event.dateTimestamp
        };
      });

      return { events: result };
    }

    @Get("find-by-id/:id")
    @ApiOperation({ summary: 'Get event by ID (public)' })
    @ApiResponse({ status: 200, description: 'Event retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Event not found' })
    async findByIdPublic(@Param("id") id: string) {
        const event = await this.findEventById.execute({ id });

        if (!event) {
            throw new BadRequestException('Evento não encontrado');
        }

        // Verificar se o evento está ativo e aprovado
        if (!event.event.isActive) {
            throw new BadRequestException('Evento não está disponível');
        }

        return { event: EventViewModel.toHTTP(event.event) }
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id")
    @ApiOperation({ summary: 'Get event by ID (authenticated)' })
    @ApiResponse({ status: 200, description: 'Event retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Event not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findById(@Param("id") id: string, @Request() req) {
        const { userId: useruid, type } = req.user

        const event = await this.findEventById.execute({ id });

        if (!event) {
            throw new BadRequestException('Evento não encontrado');
        }

        // Verificar permissões baseado no tipo de usuário
        if (type === 'PROFESSIONAL_PROMOTER') {
            // Promoters só podem ver eventos criados por eles
            if (event.event.useruid !== useruid) {
                throw new UnauthorizedException('Você não tem permissão para visualizar este evento');
            }
        } else if (type === 'PROFESSIONAL_OWNER') {
            // Owners podem ver eventos do seu estabelecimento
            const establishments = await this.prisma.establishment.findMany({
                where: { userOwnerUid: useruid },
                select: { id: true }
            });
            
            const establishmentIds = establishments.map(e => e.id);
            if (!establishmentIds.includes(event.event.establishmentId)) {
                throw new UnauthorizedException('Você não tem permissão para visualizar este evento');
            }
        } else {
            // Outros tipos de usuário só podem ver eventos criados por eles
            if (event.event.useruid !== useruid) {
                throw new UnauthorizedException('Você não tem permissão para visualizar este evento');
            }
        }

        return { event: EventViewModel.toHTTP(event.event) }
    }

    @UseGuards(JwtAuthGuard, EnsureProfessionalUser)
    @Put(":id")
    @ApiOperation({ summary: 'Update event' })
    @ApiBody({ type: UpdateEventBody })
    @ApiResponse({ status: 200, description: 'Event updated successfully' })
    @ApiResponse({ status: 400, description: 'Invalid data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async update(@Param("id") id: string, @Request() req, @Body() body: UpdateEventBody) {
        const { userId: useruid } = req.user

        const { name, description, photos, isActive, establishmentId } = body

        const event = await this.updateEvent.execute({
            id,
            name,
            description,
            photos,
            isActive,
            establishmentId
        })

        return { event: EventViewModel.toHTTP(event.event) }
    }

    @UseGuards(JwtAuthGuard, EnsureProfessionalUser)
    @Delete(":id")
    @ApiOperation({ summary: 'Delete event (only if no sales)' })
    @ApiResponse({ status: 200, description: 'Event deleted successfully' })
    @ApiResponse({ status: 400, description: 'Event cannot be deleted (has sales)' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Event not found' })
    async delete(@Param("id") id: string, @Request() req): Promise<{ message: string }> {
        const { userId: useruid } = req.user;

        try {
            const result = await this.deleteEvent.execute({
                id,
                useruid
            });

            return result;
        } catch (error) {
            if (error.message.includes('não encontrado')) {
                throw new BadRequestException(error.message);
            }
            if (error.message.includes('permissão')) {
                throw new UnauthorizedException(error.message);
            }
            if (error.message.includes('vendas')) {
                throw new BadRequestException(error.message);
            }
            throw new BadRequestException('Erro ao excluir evento');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post(":id/approve")
    @ApiOperation({ summary: 'Approve event' })
    @ApiResponse({ status: 200, description: 'Event approved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async approveEvent(@Param("id") id: string, @Request() req) {
        const { type } = req.user;

        // Apenas PROFESSIONAL_OWNER pode aprovar eventos
        if (type !== 'PROFESSIONAL_OWNER') {
            throw new UnauthorizedException('Apenas proprietários de estabelecimentos podem aprovar eventos');
        }

        await this.approveEventUseCase.execute({ eventId: id, useruid: req.user.userId });

        return { message: 'Evento aprovado com sucesso' };
    }

    @UseGuards(JwtAuthGuard)
    @Post(":id/reject")
    @ApiOperation({ summary: 'Reject event' })
    @ApiResponse({ status: 200, description: 'Event rejected successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async rejectEvent(@Param("id") id: string, @Request() req) {
        const { type } = req.user;

        // Apenas PROFESSIONAL_OWNER pode rejeitar eventos
        if (type !== 'PROFESSIONAL_OWNER') {
            throw new UnauthorizedException('Apenas proprietários de estabelecimentos podem rejeitar eventos');
        }

        await this.rejectEventUseCase.execute({ eventId: id, useruid: req.user.userId });

        return { message: 'Evento rejeitado com sucesso' };
    }
}
