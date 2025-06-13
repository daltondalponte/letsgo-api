import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PermissionsService } from '../permissions.service';

@Injectable()
export class EnsureOwnerEstablishment implements CanActivate {

  constructor(
    private permissionsService: PermissionsService,
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request = context.switchToHttp().getRequest();
    if (Object.values(request.body).some((value: any) => !String(value).length)) return false
    const establishmentId = request.body?.establishmentId ?? request.params?.establishmentId;
    if (!establishmentId) return false
    const userId = request.user?.userId;


    const permissaoValida = await this.permissionsService.isOwnerOfEstablishment(establishmentId, userId)

    return permissaoValida;
  }
}
