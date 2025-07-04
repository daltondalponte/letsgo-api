import { randomUUID } from "crypto";
import { Replace } from "@helpers/Replace";

export interface TicketTakerProps {
    userTicketTakerUid: string;
    userOwnerUid: string;
    createdAt: Date;
    updatedAt: Date
}

export class TicketTaker {
    private _id: string;
    private props: TicketTakerProps;

    constructor(props: Replace<TicketTakerProps, { createdAt?: Date, updatedAt?: Date }>, id?: string) {
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

    public set userTicketTakerUid(userTicketTakerUid: string) {
        this.props.userTicketTakerUid = userTicketTakerUid;
    }

    public get userTicketTakerUid(): string {
        return this.props.userTicketTakerUid;
    }

    public set userOwnerUid(userOwnerUid: string) {
        this.props.userOwnerUid = userOwnerUid;
    }

    public get userOwnerUid(): string {
        return this.props.userOwnerUid;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }

}