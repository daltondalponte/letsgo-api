import { CreateUser } from "@application/user/use-cases/create-user";
import { FindUserByEmail } from "@application/user/use-cases/find-user-by-email";
import { DataBaseModule } from "@infra/database/database.module";
import { Module } from "@nestjs/common";
import { UserController } from "./controllers/user.controller";
import { AuthModule } from "./auth/auth.module";
import { AuthController } from "./controllers/auth.controller";
import { EventController } from "./controllers/event.controller";
import { CreateEvent } from "@application/event/use-cases/create-event";
import { FindEventsByUserUidOrEstablishmentId } from "@application/event/use-cases/find-many-by-user";
import { CreateEstablishment } from "@application/establishment/use-cases/create-establishment";
import { FindEstablishmentByUserUid } from "@application/establishment/use-cases/find-many-by-user";
import { EstablishmentController } from "./controllers/establishment.controller";
import { CreateTicketTaker } from "@application/ticketTaker/use-cases/create-ticket-taker";
import { FindTicketTakerById } from "@application/ticketTaker/use-cases/find-by-id";
import { DeleteTicketTaker } from "@application/ticketTaker/use-cases/delete-ticket-taker";
import { DeleteUserById } from "@application/user/use-cases/delete-user-by-id";
import { TicketController } from "./controllers/ticket.controller";
import { CreateTicket } from "@application/ticket/use-cases/create-ticket";
import { FindTicketsByEvent } from "@application/ticket/use-cases/find-many-by-event";
import { SaveUser } from "@application/user/use-cases/save-user";
import { CreateManyTickets } from "@application/ticket/use-cases/create-many-tickets";
import { FindTicketById } from "@application/ticket/use-cases/find-by-id";
import { CreatePayment } from "@application/payment/use-cases/create-payment";
import { CreateTicketPurchase } from "@application/ticket/use-cases/create-ticket-purchase";
import { FindTicketPurchase } from "@application/ticket/use-cases/find-ticket-purchase";
import { UpdateEvent } from "@application/event/use-cases/update-event";
import { FindEventById } from "@application/event/use-cases/find-event-by-id";
import { UpdateTicket } from "@application/ticket/use-cases/update-ticket";
import { FindTicketsTakerByOwner } from "@application/ticketTaker/use-cases/find-many-by-owner";
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
import { PaymentModule } from "@infra/payment/payment.module";
import { FindTicketByIdWithDetails } from "@application/ticket/use-cases/find-ticket-with-details";
import { WebHookController } from "./controllers/webhook.controller";
import { UpdatePayment } from "@application/payment/use-cases/update-payment";
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
import { EventManagerController } from "./controllers/event-manager.controller";
import { FindEventManagerByUserUid } from "@application/event-manager/use-cases/find-event-manager-by-userid";
import { UpdateEventManager } from "@application/event-manager/use-cases/update-event-manager";
import { CreateEventManager } from "@application/event-manager/use-cases/create-event-manager";
import { DeleteEventManager } from "@application/event-manager/use-cases/delete-event-manager";
import { FindCuponsByEventId } from "@application/cupom/use-cases/find-by-event-id";
import { AttachCupomTicket } from "@application/cupom/use-cases/attach-cupom-ticket";
import { DettachCupomTicket } from "@application/cupom/use-cases/dettach-cupom-ticket copy";
import { FindEventManagerByEventId } from "@application/event-manager/use-cases/find-event-manager-by-eventid";
import { CreateEventApproval } from "@application/event-manager/use-cases/create-event-approval";
import { FindTicketsByEventAdmin } from "@application/ticket/use-cases/find-many-by-event-to-admin";
import { FindAllUsers } from "@application/user/use-cases/find-all-users";
import { FindAllEvents } from "@application/event/use-cases/find-all-events";
import { FindAllTickets } from "@application/ticket/use-cases/find-all-tickets";
import { FindAllCustomers } from "@application/user/use-cases/find-all-customers";
import { AdminController } from "./controllers/admin.controller";

@Module({
    imports: [DataBaseModule, AuthModule, MailModule, PaymentModule],
    controllers: [
        UserController,
        AuthController,
        EventController,
        EstablishmentController,
        TicketController,
        CupomController,
        EventManagerController,
        WebHookController,
        AdminController // Adicione AdminController aqui
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
        CreateTicket,
        CreateManyTickets,
        UpdateTicket,
        FindTicketByIdWithDetails,
        FindTicketsByEvent,
        FindTicketPurchase,
        FindTicketById,
        ConferredTicketPurchase,
        FindTicketPurchasebyId,
        CreatePayment,
        UpdateProfessional,
        CreateTicketPurchase,
        UpdatePayment,
        CreateCupom,
        UpdateCupom,
        FindCuponsByTicketId,
        FindCuponsByTicketIdAndCode,
        FindTicketsByEventAdmin,
        FindCuponsByEventId,
        AttachCupomTicket,
        DettachCupomTicket,
        CreateEventAudit,
        CreateCupomAudit,
        CreateTicketAudit,
        FindEventManagerByUserUid,
        UpdateEventManager,
        CreateEventApproval,
        FindEventManagerByEventId,
        CreateEventManager,
        DeleteEventManager
    ]
})

export class HttpModule { }
