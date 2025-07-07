import { Body, Controller, Post, Put, Delete, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CanInsertTicketsGuard } from '../auth/guards/ticket/can-insert-tickets.guard';
import { CanUpdateticketsGuard } from '../auth/guards/ticket/can-update-tickets.guard';
import { CanDeleteTicketsGuard } from '../auth/guards/ticket/can-delete-tickets.guard';
import { TicketBody } from '../dtos/ticket/create-ticket-body';
import { UpdateTicketBody } from '../dtos/ticket/update-ticket-body';
import { CreateTicket } from '@application/ticket/use-cases/create-ticket';
import { UpdateTicket } from '@application/ticket/use-cases/update-ticket';
import { DeleteTicket } from '@application/ticket/use-cases/delete-ticket';
import { TicketViewModel } from '../view-models/ticket/ticket-view-model';

@ApiTags('Ticket')
@Controller('ticket')
export class TicketController {
  constructor(
    private createTicket: CreateTicket,
    private updateTicket: UpdateTicket,
    private deleteTicket: DeleteTicket,
  ) {}

  @UseGuards(JwtAuthGuard, CanInsertTicketsGuard)
  @Post('create')
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
  @Put('update')
  async update(@Request() req, @Body() body: UpdateTicketBody) {
    const { userId: useruid } = req.user;
    const { id, price, eventId, quantity_available } = body;
    
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
  @Delete('delete/:id')
  async delete(@Param('id') id: string, @Request() req) {
    const { userId: useruid } = req.user;
    await this.deleteTicket.execute({
      id,
      useruid,
    });
    return { message: 'Ticket deletado com sucesso' };
  }
} 