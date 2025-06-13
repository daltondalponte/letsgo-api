import { randomUUID } from "crypto";
import { Replace } from "@helpers/Replace";
import { Recurso } from "@prisma/client";

export interface EventManagerProps {
    recursos: Recurso[];
    useruid: string;
    eventId: string;
    createdAt: Date;
    updatedAt: Date
}

export class EventManager {
    _id: string;
    private props: EventManagerProps;

    constructor(props: Replace<EventManagerProps, { createdAt?: Date, updatedAt?: Date }>, id?: string) {
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

    public set useruid(useruid: string) {
        this.props.useruid = useruid;
    }

    public get useruid(): string {
        return this.props.useruid;
    }

    public set recursos(recursos: Recurso[]) {
        this.props.recursos = recursos;
    }

    public get recursos(): Recurso[] {
        return this.props.recursos;
    }

    public set eventId(eventId: string) {
        this.props.eventId = eventId;
    }

    public get eventId(): string {
        return this.props.eventId;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }

}