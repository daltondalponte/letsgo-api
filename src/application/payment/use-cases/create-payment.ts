
import { Payment, PaymentMethod, PaymentStatus } from "../entity/Payment";
import { Injectable } from "@nestjs/common"
import { PaymentRepository } from "../repository/payment-repository";
import { FindTicketById } from "@application/ticket/use-cases/find-by-id";

interface PaymentRequest {
    useruid: string;
    ticketId: string;
}

interface PaymentResponse {
    payment: Payment;
}

@Injectable()
export class CreatePayment {

    constructor(
        private paymentRepository: PaymentRepository,
        private findTicketById: FindTicketById
    ) { }

    async execute(request: PaymentRequest): Promise<PaymentResponse> {
        const { ticketId, useruid } = request

        const { ticket } = await this.findTicketById.execute({ id: ticketId })

        const payment = new Payment({
            amount: ticket.price,
            payment_method: PaymentMethod.CREDITCARD,
            status: PaymentStatus.PENDING,
            ticketId,
            useruid
        })

        await this.paymentRepository.create(payment)

        return { payment }
    }
}