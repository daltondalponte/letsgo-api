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

    // DEBUG: Log dos dados recebidos
    console.log('=== DEBUG CAN UPDATE CUPONS GUARD ===');
    console.log('request.method:', request.method);
    console.log('request.params:', request.params);
    console.log('request.body:', request.body);
    console.log('request.query:', request.query);
    console.log('request.user:', request.user);
    console.log('userId:', request.user?.userId);

    // Para DELETE, o body pode estar vazio, então não validamos valores vazios
    if (request.method !== 'DELETE' && Object.values(request.body).some((value: any) => !String(value).length)) {
      console.log('❌ Guard falhou: valores vazios no body');
      return false;
    }
    
    const cupomId = request.params?.id || request.query?.id || request.body?.id;
    const userId = request.user?.userId;

    console.log('cupomId:', cupomId);
    console.log('userId:', userId);

    if (!cupomId) {
      console.log('❌ Guard falhou: cupomId não encontrado');
      return false;
    }

    // Buscar o cupom pelo id
    const cupom = await this.permissionsService.getPrisma().cupom.findUnique({ where: { id: cupomId } });
    console.log('cupom encontrado:', cupom);
    
    if (!cupom) {
      console.log('❌ Guard falhou: cupom não encontrado');
      return false;
    }

    // Se for cupom global, permitir se o useruid for igual ao userId
    if (!cupom.eventId && cupom.useruid === userId) {
      console.log('✅ Guard aprovado: cupom global do usuário');
      return true;
    }

    // Se for cupom de evento, seguir a lógica já existente
    const permissaoValida = await this.permissionsService.canUpdateCupons(cupom.eventId, userId);
    console.log('permissaoValida:', permissaoValida);
    
    return permissaoValida;
  }
}
