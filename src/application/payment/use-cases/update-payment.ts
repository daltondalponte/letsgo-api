
import { Payment, PaymentMethod, PaymentStatus } from "../entity/Payment";
import { Injectable } from "@nestjs/common"
import { PaymentRepository } from "../repository/payment-repository";
import { FindTicketById } from "@application/ticket/use-cases/find-by-id";

interface PaymentRequest {
    paymentId: string;
    status: string;
}

@Injectable()
export class UpdatePayment {

    constructor(
        private paymentRepository: PaymentRepository
    ) { }

    async execute(request: PaymentRequest): Promise<void> {
        const { paymentId, status } = request

        if (!paymentId) return

        await this.paymentRepository.save(paymentId, status)

    }
}