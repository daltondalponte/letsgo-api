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

    if (Object.values(request.body).some((value: any) => !String(value).length)) return false
    const cupomId = request.query?.id || request.body?.id;
    const userId = request.user?.userId;

    if (!cupomId) return false;

    // Buscar o cupom pelo id
    const cupom = await this.permissionsService.getPrisma().cupom.findUnique({ where: { id: cupomId } });
    if (!cupom) return false;

    // Se for cupom global, permitir se o useruid for igual ao userId
    if (!cupom.eventId && cupom.useruid === userId) return true;

    // Se for cupom de evento, seguir a lógica já existente
    const permissaoValida = await this.permissionsService.canUpdateCupons(cupom.eventId, userId)
    return permissaoValida;
  }
}
