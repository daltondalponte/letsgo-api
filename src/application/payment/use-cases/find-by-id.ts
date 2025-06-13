
import { Payment, PaymentMethod, PaymentStatus } from "../entity/Payment";
import { Injectable } from "@nestjs/common"
import { PaymentRepository } from "../repository/payment-repository";

interface PaymentRequest {
    paymentId: string;
}

interface PaymentResponse {
    payment: Payment;
}

@Injectable()
export class FindPaymentById {

    constructor(
        private paymentRepository: PaymentRepository
    ) { }

    async execute(request: PaymentRequest): Promise<PaymentResponse> {
        const { paymentId } = request


        const payment = await this.paymentRepository.findById(paymentId)

        return { payment }
    }
}