import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PermissionsService } from '../permissions.service';

@Injectable()
export class EnsureOwnerEvent implements CanActivate {

  constructor(
    private permissionsService: PermissionsService,
  ) { }

 async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request = context.switchToHttp().getRequest();
    const eventId = request.body?.eventId ?? request.params?.eventId;

    const userId = request.user?.userId;
    const permissaoValida = this.permissionsService.isOwnerOfEvent(eventId, userId)

    return permissaoValida;
  }
}
