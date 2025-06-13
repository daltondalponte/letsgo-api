import { randomUUID } from "crypto";
import { Replace } from "@helpers/Replace";
import { ModificationType } from "@prisma/client";

export interface AuditEntityProps {
    useruid: string;
    entityId: string;
    modificationType: ModificationType;
    details: {};
    createdAt: Date;
    updatedAt: Date
}

export class AuditEntity {
    _id: string;
    private props: AuditEntityProps;

    constructor(props: Replace<AuditEntityProps, { createdAt?: Date, updatedAt?: Date }>, id?: string) {
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

    public set entityId(entityId: string) {
        this.props.entityId = entityId;
    }

    public get entityId(): string {
        return this.props.entityId;
    }


    public set modificationType(modificationType: ModificationType) {
        this.props.modificationType = modificationType;
    }

    public get modificationType(): ModificationType {
        return this.props.modificationType;
    }

    public set details(details: any) {
        this.props.details = details;
    }

    public get details() {
        return this.props.details;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }

}