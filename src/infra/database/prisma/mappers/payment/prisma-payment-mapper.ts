
import { Payment, PaymentMethod, PaymentStatus } from "@application/payment/entity/Payment";
import { Payment as RawPayment } from "@prisma/client";

export class PrismaPaymentMapper {
    static toPrisma(payment: Payment) {
        return {
            id: payment.id,
            amount: payment.amount,
            payment_method: payment.payment_method,
            status: payment.status,
            useruid: payment.useruid,
            ticketId: payment.ticketId,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt
        }
    }

    static toDomain(rawPayment: RawPayment) {
        return new Payment({
            amount: Number(rawPayment.amount),
            payment_method: rawPayment.payment_method as PaymentMethod,
            status: rawPayment.status as PaymentStatus,
            useruid: rawPayment.useruid,
            ticketId: rawPayment.ticketId,
            createdAt: rawPayment.createdAt,
            updatedAt: rawPayment.updatedAt
        }, rawPayment.id)
    }
}