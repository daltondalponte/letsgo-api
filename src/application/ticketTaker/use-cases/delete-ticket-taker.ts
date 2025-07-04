import { Injectable, NotFoundException } from "@nestjs/common";
import { TicketTakerRepository } from "../repository/ticket-taker-repository";
import { DeleteUserById } from "@application/user/use-cases/delete-user-by-id";
import { PrismaService } from "@infra/database/prisma/prisma.service";

interface TicketTakerRequest {
    id: string;
}

@Injectable()
export class DeleteTicketTaker {

    constructor(
        private ticketTackerRepository: TicketTakerRepository,
        private deleteUserById: DeleteUserById,
        private prisma: PrismaService
    ) { }

    async execute(request: TicketTakerRequest): Promise<void> {
        const { id } = request

        try {
            // Verificar se o usuário existe
            const user = await this.prisma.user.findUnique({
                where: { uid: id }
            });

            if (!user) {
                throw new NotFoundException('Usuário não encontrado');
            }

            // Verificar se é um TICKETTAKER
            if (user.type !== 'TICKETTAKER') {
                throw new NotFoundException('Usuário não é um TICKETTAKER');
            }

            // Tentar encontrar o registro TicketTaker
            let ticketTaker = null;
            try {
                ticketTaker = await this.ticketTackerRepository.findByUserTakerId(id);
            } catch (error) {
                // Se não encontrar o registro TicketTaker, continuar apenas com a deleção do usuário
                console.log('Registro TicketTaker não encontrado, deletando apenas o usuário');
            }

            // Se encontrou o registro TicketTaker, deletá-lo primeiro
            if (ticketTaker) {
                await this.ticketTackerRepository.delete(ticketTaker.id);
            }

            // Deletar relacionamentos de autenticação
            await this.prisma.refreshToken.deleteMany({
                where: { useruid: id }
            });

            await this.prisma.userRole.deleteMany({
                where: { useruid: id }
            });

            // Por último, deletar o usuário
            await this.deleteUserById.execute({ id });

        } catch (error) {
            console.error('Erro no DeleteTicketTaker:', error);
            
            if (error instanceof NotFoundException) {
                throw error;
            }
            
            throw new Error('Erro ao deletar TICKETTAKER');
        }
    }
}