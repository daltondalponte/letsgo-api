import { Body, Controller, Post, Put, Delete, UseGuards, Request, Param, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CanInsertTicketsGuard } from '../auth/guards/ticket/can-insert-tickets.guard';
import { CanUpdateticketsGuard } from '../auth/guards/ticket/can-update-tickets.guard';
import { CanDeleteTicketsGuard } from '../auth/guards/ticket/can-delete-tickets.guard';
import { TicketBody } from '../dtos/ticket/create-ticket-body';
import { UpdateTicketBody } from '../dtos/ticket/update-ticket-body';
import { CreateTicket } from '@application/ticket/use-cases/create-ticket';
import { UpdateTicket } from '@application/ticket/use-cases/update-ticket';
import { DeleteTicket } from '@application/ticket/use-cases/delete-ticket';
import { FindTicketPurchase } from '@application/ticket/use-cases/find-ticket-purchase';
import { TicketViewModel } from '../view-models/ticket/ticket-view-model';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketController {
  constructor(
    private createTicket: CreateTicket,
    private updateTicket: UpdateTicket,
    private deleteTicket: DeleteTicket,
    private findTicketPurchase: FindTicketPurchase,
  ) {}

  @UseGuards(JwtAuthGuard, CanInsertTicketsGuard)
  @Post()
  @ApiOperation({ 
    summary: 'Criar novo ingresso',
    description: 'Cria um novo tipo de ingresso para um evento. Apenas owners e promoters podem criar ingressos.'
  })
  @ApiBody({ 
    type: TicketBody,
    description: 'Dados do ingresso a ser criado',
    examples: {
      ingressoPadrao: {
        summary: 'Ingresso padrão',
        value: {
          description: 'Ingresso Padrão',
          price: 50.00,
          eventId: 'uuid-do-evento',
          quantity_available: 100
        }
      },
      ingressoVIP: {
        summary: 'Ingresso VIP',
        value: {
          description: 'Ingresso VIP com área exclusiva',
          price: 150.00,
          eventId: 'uuid-do-evento',
          quantity_available: 50
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Ingresso criado com sucesso',
    schema: {
      type: 'object',
      properties: {
        ticket: { type: 'object', description: 'Dados do ingresso criado' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async create(@Request() req, @Body() body: TicketBody) {
    const { userId: useruid } = req.user;
    const { description, price, eventId, quantity_available } = body;
    
    const { ticket } = await this.createTicket.execute({
      description,
      price,
      eventId,
      quantity_available,
      useruid,
    });
    
    return { ticket: TicketViewModel.toHTTP(ticket) };
  }

  @UseGuards(JwtAuthGuard, CanUpdateticketsGuard)
  @Put(':id')
  @ApiOperation({ 
    summary: 'Atualizar ingresso',
    description: 'Atualiza os dados de um ingresso existente. Apenas o criador do ingresso pode atualizá-lo.'
  })
  @ApiBody({ 
    type: UpdateTicketBody,
    description: 'Dados do ingresso a ser atualizado',
    examples: {
      atualizarPreco: {
        summary: 'Atualizar preço e quantidade',
        value: {
          price: 75.00,
          eventId: 'uuid-do-evento',
          quantity_available: 80
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Ingresso atualizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        ticket: { type: 'object', description: 'Dados do ingresso atualizado' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Ingresso não encontrado' })
  async update(@Param('id') id: string, @Request() req, @Body() body: UpdateTicketBody) {
    const { userId: useruid } = req.user;
    const { price, eventId, quantity_available } = body;
    
    const { ticket } = await this.updateTicket.execute({
      id,
      price,
      eventId,
      quantity_available,
      useruid,
    });
    
    return { ticket: TicketViewModel.toHTTP(ticket) };
  }

  @UseGuards(JwtAuthGuard, CanDeleteTicketsGuard)
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Deletar ingresso',
    description: 'Remove um ingresso do sistema. Apenas o criador do ingresso pode deletá-lo.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Ingresso deletado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Ticket deleted successfully' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Ingresso não encontrado' })
  async delete(@Param('id') id: string, @Request() req) {
    const { userId: useruid } = req.user;
    await this.deleteTicket.execute({
      id,
      useruid,
    });
    return { message: 'Ticket deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  @ApiOperation({ 
    summary: 'Buscar ingressos do usuário',
    description: 'Retorna todos os ingressos comprados pelo usuário autenticado.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Ingressos encontrados com sucesso',
    schema: {
      type: 'object',
      properties: {
        tickets: { 
          type: 'array',
          items: { type: 'object' },
          description: 'Lista de ingressos comprados pelo usuário'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getUserTickets(@Request() req) {
    const { userId } = req.user;
    const { tickets } = await this.findTicketPurchase.execute({ userId });
    return { tickets };
  }
} 