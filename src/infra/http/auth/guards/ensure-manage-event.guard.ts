import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { PermissionsService } from '../permissions.service';

@Injectable()
export class EnsureManagerEvent implements CanActivate {

  constructor(
    private permissionsService: PermissionsService,
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request = context.switchToHttp().getRequest();

    const eventId = request.body?.eventId ?? request.params?.eventId ?? request.query?.eventId;

    const userId = request.user?.userId;
    const permissaoValida = await this.permissionsService.isManagerOfEvent(eventId, userId)

    return permissaoValida;
  }
}
