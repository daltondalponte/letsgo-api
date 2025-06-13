import { Payment } from "../entity/Payment";


export abstract class PaymentRepository {
    abstract create(payment: Payment): Promise<void>;
    abstract findById(paymentId: string): Promise<Payment | null>;
    abstract save(id: string, status: string): Promise<void>;
}