import { randomUUID } from "crypto";
import { Replace } from "@helpers/Replace";

export interface TicketProps {
    description: string;
    price: number;
    eventId: string;
    quantity_available: number;
    useruid?: string;
    createdAt: Date;
    updatedAt: Date
}

export class Ticket {
    _id: string;
    private props: TicketProps;

    constructor(props: Replace<TicketProps, { createdAt?: Date, updatedAt?: Date }>, id?: string) {
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

    public set price(price: number) {
        this.props.price = price;
    }

    public get price() {
        return this.props.price;
    }

    public set description(description: string) {
        this.props.description = description;
    }

    public get description(): string {
        return this.props.description;
    }

    public set quantity_available(quantity_available: number) {
        this.props.quantity_available = quantity_available;
    }

    public get quantity_available(): number {
        return this.props.quantity_available;
    }

    public set eventId(eventId: string) {
        this.props.eventId = eventId;
    }

    public get eventId(): string {
        return this.props.eventId;
    }

    public set useruid(useruid: string) {
        this.props.useruid = useruid;
    }

    public get useruid(): string {
        return this.props.useruid;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }

}