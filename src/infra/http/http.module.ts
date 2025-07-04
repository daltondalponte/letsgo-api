    import { CreateUser } from "@application/user/use-cases/create-user";
import { FindUserByEmail } from "@application/user/use-cases/find-user-by-email";
import { DataBaseModule } from "@infra/database/database.module";
import { Module } from "@nestjs/common";
import { UserController } from "./controllers/user.controller";
import { AuthModule } from "./auth/auth.module";
import { AuthController } from "./controllers/auth.controller";
import { CreateEvent } from "@application/event/use-cases/create-event";
import { FindEventsByUserUidOrEstablishmentId } from "@application/event/use-cases/find-many-by-user";
import { CreateEstablishment } from "@application/establishment/use-cases/create-establishment";
import { FindEstablishmentByUserUid } from "@application/establishment/use-cases/find-many-by-user";
import { EstablishmentController } from "./controllers/establishment.controller";
import { CreateTicketTaker } from "@application/ticketTaker/use-cases/create-ticket-taker";
import { FindTicketTakerById } from "@application/ticketTaker/use-cases/find-by-id";
import { DeleteTicketTaker } from "@application/ticketTaker/use-cases/delete-ticket-taker";
import { DeleteUserById } from "@application/user/use-cases/delete-user-by-id";
import { FindTicketsTakerByOwner } from "@application/ticketTaker/use-cases/find-many-by-owner";
import { SaveUser } from "@application/user/use-cases/save-user";
import { CreateManyTickets } from "@application/ticket/use-cases/create-many-tickets";
import { FindTicketById } from "@application/ticket/use-cases/find-by-id";
import { CreateTicketPurchase } from "@application/ticket/use-cases/create-ticket-purchase";
import { FindTicketPurchase } from "@application/ticket/use-cases/find-ticket-purchase";
import { UpdateEvent } from "@application/event/use-cases/update-event";
import { FindEventById } from "@application/event/use-cases/find-event-by-id";
import { UpdateTicket } from "@application/ticket/use-cases/update-ticket";
import { UpdateUSer } from "@application/user/use-cases/update-user";
import { MailModule } from "@infra/email/nodemailer/mail.module";
import { FindAllEstablishments } from "@application/establishment/use-cases/find-many";
import { UpdateEstablishmentPhoto } from "@application/establishment/use-cases/update-photos";
import { UpdateEventListNames } from "@application/event/use-cases/update-event-list-names";
import { UpdateEventTakers } from "@application/event/use-cases/update-event-takers";
import { FindTicketTakerByUserTakerId } from "@application/ticketTaker/use-cases/find-by-user-taker";
import { FindTicketPurchasebyId } from "@application/ticket/use-cases/find-ticket-purchase-by-id";
import { ConferredTicketPurchase } from "@application/ticket/use-cases/conferred-ticket-sale";
import { FindAllProfessionals } from "@application/user/use-cases/find-all-professionals";
import { UpdateProfessional } from "@application/user/use-cases/update-professional-user";
import { FindUserById } from "@application/user/use-cases/find-user-by-id";
import { FindTicketByIdWithDetails } from "@application/ticket/use-cases/find-ticket-with-details";
import { WebHookController } from "./controllers/webhook.controller";
import { SaveUserDeviceToken } from "@application/user/use-cases/upsert-device-token";
import { CupomController } from "./controllers/cupom.controller";
import { CreateCupom } from "@application/cupom/use-cases/create-cupom";
import { UpdateCupom } from "@application/cupom/use-cases/update-cupom";
import { FindCuponsByTicketId } from "@application/cupom/use-cases/find-by-ticket";
import { FindCuponsByTicketIdAndCode } from "@application/cupom/use-cases/find-by-ticket-and-code";
import { CreateEventAudit } from "@application/audit-entity/use-cases/event/create-event-audit";
import { CreateCupomAudit } from "@application/audit-entity/use-cases/cupom/create-cupom-audit";
import { CreateTicketAudit } from "@application/audit-entity/use-cases/ticket/create-ticket-audit";
import { FindEstablishmentById } from "@application/establishment/use-cases/find-many-by-id";
import { FindAllUsers } from "@application/user/use-cases/find-all-users";
import { FindAllEvents } from "@application/event/use-cases/find-all-events";
import { FindAllTickets } from "@application/ticket/use-cases/find-all-tickets";
import { FindAllCustomers } from "@application/user/use-cases/find-all-customers";
import { AdminController } from "./controllers/admin.controller";
import { UpdateEstablishment } from "@application/establishment/use-cases/update-establishment";
import { AttachCupomTicket } from '@application/cupom/use-cases/attach-cupom-ticket';
import { DettachCupomTicket } from '@application/cupom/use-cases/dettach-cupom-ticket copy';
import { FindCuponsByEventId } from '@application/cupom/use-cases/find-by-event-id';
import { StripeService } from '@infra/payment/stripe.service';
import { CreatePayment } from '@application/payment/use-cases/create-payment';
import { UpdatePayment } from '@application/payment/use-cases/update-payment';
import { EventController } from './controllers/event.controller';
import { EventManagerController } from './controllers/event-manager.controller';
import { CreateEventManager } from '@application/event-manager/use-cases/create-event-manager';
import { FindEventManagerByEventId } from '@application/event-manager/use-cases/find-event-manager-by-eventid';
import { FindEventManagerById } from '@application/event-manager/use-cases/find-event-manager-by-id';
import { DeleteEventManager } from '@application/event-manager/use-cases/delete-event-manager';
import { UpdateEventManager } from '@application/event-manager/use-cases/update-event-manager';

@Module({
    imports: [DataBaseModule, AuthModule, MailModule],
    controllers: [
        UserController,
        AuthController,
        EstablishmentController,
        CupomController,
        WebHookController,
        AdminController, // Adicione AdminController aqui
        EventController,
        EventManagerController
    ],
    providers: [
        CreateUser,
        UpdateUSer,
        SaveUser,
        SaveUserDeviceToken,
        FindAllProfessionals,
        CreateTicketTaker,
        DeleteTicketTaker,
        FindTicketsTakerByOwner,
        DeleteUserById,
        FindTicketTakerById,
        FindTicketTakerByUserTakerId,
        FindUserByEmail,
        FindUserById,
        FindAllCustomers,
        FindAllUsers, // Adicione os novos casos de uso aqui
        FindAllEvents,
        FindAllTickets,
        CreateEvent,
        UpdateEvent,
        UpdateEventTakers,
        UpdateEventListNames,
        FindEventById,
        FindEventsByUserUidOrEstablishmentId,
        CreateEstablishment,
        FindEstablishmentByUserUid,
        FindEstablishmentById,
        UpdateEstablishmentPhoto,
        FindAllEstablishments,
        CreateManyTickets,
        UpdateTicket,
        FindTicketByIdWithDetails,
        FindTicketPurchase,
        FindTicketPurchasebyId,
        CreateTicketPurchase,
        CreateCupom,
        UpdateCupom,
        FindCuponsByTicketId,
        FindCuponsByTicketIdAndCode,
        CreateEventAudit,
        CreateCupomAudit,
        CreateTicketAudit,
        UpdateEstablishment,
        UpdateProfessional,
        AttachCupomTicket,
        DettachCupomTicket,
        FindCuponsByEventId,
        StripeService,
        CreatePayment,
        UpdatePayment,
        FindTicketById,
        CreateEventManager,
        FindEventManagerByEventId,
        FindEventManagerById,
        DeleteEventManager,
        UpdateEventManager,
        CreateUser,
        DeleteUserById
    ]
})

export class HttpModule { }
