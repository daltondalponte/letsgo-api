import { randomUUID } from "crypto";
import { Replace } from "@helpers/Replace";

export interface CupomProps {
    code: string;
    descont_percent?: number;
    discont_value?: number;
    discount_value?: number;
    quantity_available: number;
    expiresAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    eventId?: string;
    useruid?: string;
    description?: string;
}

export class Cupom {
    _id: string;
    private props: CupomProps;

    constructor(props: Replace<CupomProps, { createdAt?: Date, updatedAt?: Date }>, id?: string) {
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

    public set code(code: string) {
        this.props.code = code;
    }

    public get code(): string {
        return this.props.code;
    }

    public set quantityAvailable(qtde: number) {
        this.props.quantity_available = qtde;
    }

    public get quantityAvailable(): number {
        return this.props.quantity_available;
    }

    public set eventId(eventId: string | undefined) {
        this.props.eventId = eventId;
    }

    public get eventId(): string | undefined {
        return this.props.eventId;
    }

    public set useruid(useruid: string | undefined) {
        this.props.useruid = useruid;
    }

    public get useruid(): string | undefined {
        return this.props.useruid;
    }

    public set descontPercent(percent: number) {
        this.props.descont_percent = percent;
    }

    public get descontPercent(): number {
        return this.props.descont_percent;
    }

    public set discountValue(value: number) {
        this.props.discont_value = value;
    }

    public get discountValue(): number {
        return this.props.discont_value;
    }

    public set expiresAt(expiresAt: Date) {
        this.props.expiresAt = expiresAt;
    }

    public get expiresAt(): Date {
        return this.props.expiresAt;
    }

    public set description(description: string | undefined) {
        this.props.description = description;
    }
    public get description(): string | undefined {
        return this.props.description;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }

}