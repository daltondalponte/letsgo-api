import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PermissionsService } from '../../permissions.service';

@Injectable()
export class CanUpdateCuponsGuard implements CanActivate {

  constructor(
    private permissionsService: PermissionsService,
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request = context.switchToHttp().getRequest();

    // Para DELETE, o body pode estar vazio, então não validamos valores vazios
    if (request.method !== 'DELETE' && Object.values(request.body).some((value: any) => !String(value).length)) {
      return false;
    }
    
    const cupomId = request.params?.id || request.query?.id || request.body?.id;
    const userId = request.user?.userId;

    if (!cupomId) {
      return false;
    }

    // Buscar o cupom pelo id
    const cupom = await this.permissionsService.getPrisma().cupom.findUnique({ where: { id: cupomId } });
    
    if (!cupom) {
      return false;
    }

    // Se for cupom global, permitir apenas se o useruid for igual ao userId
    if (!cupom.eventId && cupom.useruid === userId) {
      return true;
    }

    // Se for cupom de evento, verificar se o usuário é o criador do evento
    if (cupom.eventId) {
      const event = await this.permissionsService.getPrisma().event.findUnique({
        where: { id: cupom.eventId },
        include: { user: true }
      });
      
      if (event && event.useruid === userId) {
        return true;
      }
      
      // Se o usuário é owner do estabelecimento, verificar se pode gerenciar
      if (event?.establishmentId) {
        const establishment = await this.permissionsService.getPrisma().establishment.findUnique({
          where: { id: event.establishmentId }
        });
        
        if (establishment && establishment.userOwnerUid === userId) {
          // Owner NÃO pode editar cupons de eventos de promoters
          if (event.user.type === 'PROFESSIONAL_PROMOTER') {
            return false;
          }
          // Owner pode editar cupons apenas de eventos criados por ele mesmo
          if (event.useruid === userId) {
            return true;
          }
        }
      }
      
      return false;
    }
  }
}
