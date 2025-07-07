import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PermissionsService } from '../../permissions.service';

@Injectable()
export class CanDeleteTicketsGuard implements CanActivate {

  constructor(
    private permissionsService: PermissionsService,
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request = context.switchToHttp().getRequest();

    if (Object.values(request.params).some((value: any) => !String(value).length)) return false
    const ticketId = request.params?.id;

    if (!ticketId) return false
    const userId = request.user?.userId;
    const permissaoValida = await this.permissionsService.canDeleteTickets(ticketId, userId)

    return permissaoValida;
  }
} 