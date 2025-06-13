import { ConfigModule } from '@nestjs/config';
import { DataBaseModule } from '@infra/database/database.module';
import { HttpModule } from '@infra/http/http.module';
import { EnsureAdminMiddleware } from '@infra/http/middleware/ensure-authenticate';
import { PaymentModule } from '@infra/payment/payment.module';
import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';

@Module({
  imports: [
  ConfigModule.forRoot({ isGlobal: true }), // <-- Adicione esta linha
  HttpModule,
  DataBaseModule,
  PaymentModule
],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(EnsureAdminMiddleware)
      .forRoutes(
        { method: RequestMethod.GET, path: "user/find/professionals" },
        { method: RequestMethod.PUT, path: "user/update/professionals/*" },
        { method: RequestMethod.GET, path: "user/find/customers" },
      );
  }
}
