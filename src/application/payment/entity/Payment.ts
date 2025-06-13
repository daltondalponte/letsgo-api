import { Replace } from "@helpers/Replace";
import { randomUUID } from "crypto";

export enum PaymentMethod {
    CREDITCARD = "CREDITCARD",
    DEBITCARD = "DEBITCARD",
    PIX = "PIX"
}

export enum PaymentStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    CANCELED = "CANCELED",
    FAILED = "FAILED"
}

export interface PaymentProps {
    amount: number;
    status: PaymentStatus;
    payment_method: PaymentMethod;
    useruid: string;
    ticketId: string;
    createdAt: Date;
    updatedAt: Date;
}

export class Payment {
    private _id: string;
    private props: PaymentProps;

    constructor(props: Replace<PaymentProps, { createdAt?: Date, updatedAt?: Date }>, id?: string) {
        this._id = id ?? randomUUID()
        this.props = {
            ...props,
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date()
        }
    }

    public get id(): string {
        return this._id;
    }

    public set status(status: PaymentStatus) {
        this.props.status = status;
    }

    public get status(): PaymentStatus {
        return this.props.status;
    }

    public set payment_method(payment_method: PaymentMethod) {
        this.props.payment_method = payment_method;
    }

    public get payment_method(): PaymentMethod {
        return this.props.payment_method;
    }

    public set amount(amount: number) {
        this.props.amount = amount;
    }

    public get amount(): number {
        return this.props.amount;
    }

    public set useruid(useruid: string) {
        this.props.useruid = useruid;
    }

    public get useruid(): string {
        return this.props.useruid;
    }

    public set ticketId(ticketId: string) {
        this.props.ticketId = ticketId;
    }

    public get ticketId(): string {
        return this.props.ticketId;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }

}