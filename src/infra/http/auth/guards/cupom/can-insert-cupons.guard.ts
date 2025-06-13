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

    if (Object.values(request.body).some((value: any) => !String(value).length)) return false
    const eventId = request.body?.eventId ?? request.params?.eventId;

    const userId = request.user?.userId;
    const permissaoValida = await this.permissionsService.canInsertCupons(eventId, userId)

    console.log(permissaoValida);

    return permissaoValida;
  }
}
