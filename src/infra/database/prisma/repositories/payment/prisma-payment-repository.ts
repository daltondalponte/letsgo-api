import { Payment, PaymentStatus } from "@application/payment/entity/Payment";
import { PaymentRepository } from "@application/payment/repository/payment-repository";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { PrismaPaymentMapper } from "../../mappers/payment/prisma-payment-mapper";

@Injectable()
export class PrismaPaymentRepository implements PaymentRepository {

    constructor(
        private prisma: PrismaService
    ) { }

    async create(payment: Payment): Promise<void> {
        const rawPayment = PrismaPaymentMapper.toPrisma(payment)

        await this.prisma.payment.create({
            data: rawPayment
        })
    }

    async findById(paymentId: string): Promise<Payment> {

        const payment = await this.prisma.payment.findUnique({
            where: {
                id: paymentId
            }
        })

        return PrismaPaymentMapper.toDomain(payment)
    }

    async save(id: string, status: PaymentStatus): Promise<void> {
        await this.prisma.payment.update({
            where: {
                id
            },
            data: {
                status
            }
        })
    }

}