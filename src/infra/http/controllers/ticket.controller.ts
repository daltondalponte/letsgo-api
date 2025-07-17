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
  @ApiOperation({ summary: 'Create new ticket' })
  @ApiBody({ type: TicketBody })
  @ApiResponse({ status: 201, description: 'Ticket created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Update ticket' })
  @ApiBody({ type: UpdateTicketBody })
  @ApiResponse({ status: 200, description: 'Ticket updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Delete ticket' })
  @ApiResponse({ status: 200, description: 'Ticket deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
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
  @ApiOperation({ summary: 'Get user tickets' })
  @ApiResponse({ status: 200, description: 'User tickets retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserTickets(@Request() req) {
    const { userId } = req.user;
    const { tickets } = await this.findTicketPurchase.execute({ userId });
    return { tickets };
  }
} 