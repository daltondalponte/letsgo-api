import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { UserRepository } from "@application/user/repositories/user-repository";
import { PrismaUserRepository } from "./prisma/repositories/user/prisma-user-repository";
import { FirebaseService } from "./firebase/firebase.service";
import { EventRepository } from "@application/event/repositories/event-repository";
import { PrismaEventRepository } from "./prisma/repositories/event/prisma-event-repository";
import { EstablishmentRepository } from "@application/establishment/repositories/establishment-repository";
import { PrismaEstablishmentRepository } from "./prisma/repositories/establishment/prisma-establishment-repository";
import { TicketTakerRepository } from "@application/ticketTaker/repository/ticket-taker-repository";
import { PrismaTicketTakerRepository } from "./prisma/repositories/ticket-taker/prisma-ticket-taker-repository";
import { TicketRepository } from "@application/ticket/repositories/ticket-repository";
import { PrismaTicketRepository } from "./prisma/repositories/ticket/prisma-ticket-repository";
import { PaymentRepository } from "@application/payment/repository/payment-repository";
import { PrismaPaymentRepository } from "./prisma/repositories/payment/prisma-payment-repository";
import { CupomRepository } from "@application/cupom/repositories/cupom-repository";
import { PrismaCupomRepository } from "./prisma/repositories/cupom/prisma-cupom-repository";
import { CupomAuditRepository } from "@application/audit-entity/repositories/cupom-audit-repository";
import { EventAuditRepository } from "@application/audit-entity/repositories/event-audit-repository";
import { PrismaEventAuditRepository } from "./prisma/repositories/event-audit/prisma-event-audit-repository";
import { TicketAuditRepository } from "@application/audit-entity/repositories/ticket-audit-repository";
import { EventManagerRepository } from "@application/event-manager/repositories/event-manager-repository";
import { PrismaEventManagerRepository } from "./prisma/repositories/event-manager/prisma-event-manager-repository";
import { PrismaCupomAuditRepository } from "./prisma/repositories/cupom-audit/prisma-cupom-audit-repository";
import { PrismaTicketAuditRepository } from "./prisma/repositories/ticket-audit/prisma-ticket-audit-repository";

@Module({
    providers: [
        PrismaService,
        FirebaseService,
        {
            provide: UserRepository,
            useClass: PrismaUserRepository
        },
        {
            provide: EventRepository,
            useClass: PrismaEventRepository
        },
        {
            provide: EstablishmentRepository,
            useClass: PrismaEstablishmentRepository
        },
        {
            provide: TicketTakerRepository,
            useClass: PrismaTicketTakerRepository
        },
        {
            provide: TicketRepository,
            useClass: PrismaTicketRepository
        },
        {
            provide: PaymentRepository,
            useClass: PrismaPaymentRepository
        },
        {
            provide: CupomRepository,
            useClass: PrismaCupomRepository
        },
        {
            provide: CupomAuditRepository,
            useClass: PrismaCupomAuditRepository
        },
        {
            provide: EventAuditRepository,
            useClass: PrismaEventAuditRepository
        },
        {
            provide: TicketAuditRepository,
            useClass: PrismaTicketAuditRepository
        },
        {
            provide: EventManagerRepository,
            useClass: PrismaEventManagerRepository
        }
    ],
    exports: [
        UserRepository,
        PrismaService,
        EventRepository,
        FirebaseService,
        EstablishmentRepository,
        TicketRepository,
        TicketTakerRepository,
        PaymentRepository,
        CupomRepository,
        CupomAuditRepository,
        EventAuditRepository,
        TicketAuditRepository,
        EventManagerRepository
    ]
})

export class DataBaseModule { }