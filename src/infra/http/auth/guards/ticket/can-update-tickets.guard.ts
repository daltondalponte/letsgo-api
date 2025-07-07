import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PermissionsService } from '../../permissions.service';

@Injectable()
export class CanUpdateticketsGuard implements CanActivate {

  constructor(
    private permissionsService: PermissionsService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const body = request.body;

    const eventId = body.eventId;
    const userId = user.userId;

    return this.permissionsService.canUpdateTickets(eventId, userId);
  }
}
