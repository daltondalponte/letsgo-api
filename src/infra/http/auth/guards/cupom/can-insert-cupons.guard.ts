import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PermissionsService } from '../../permissions.service';

@Injectable()
export class CanInsertCuponsGuard implements CanActivate {

  constructor(
    private permissionsService: PermissionsService,
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request = context.switchToHttp().getRequest();
    const body = request.body;

    // Verificar campos obrigatórios (excluindo eventId que é opcional)
    const requiredFields = ['code', 'quantity_available', 'expiresAt'];
    for (const field of requiredFields) {
      if (!body[field] || String(body[field]).trim().length === 0) {
        return false;
      }
    }

    const eventId = body?.eventId;
    const userId = request.user?.userId;
    
    // Se não há eventId, é um cupom global - permitir para usuários profissionais
    if (!eventId) {
      const userType = request.user?.type;
      return userType === 'PROFESSIONAL_PROMOTER' || userType === 'PROFESSIONAL_OWNER';
    }

    const permissaoValida = await this.permissionsService.canInsertCupons(eventId, userId)

    return permissaoValida;
  }
}
