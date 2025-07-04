import { randomUUID } from "crypto";
import { Replace } from "@helpers/Replace";

export type AccountRole = 'PERSONAL' | 'PROFESSIONAL_OWNER' | 'PROFESSIONAL_PROMOTER' | 'TICKETTAKER' | 'MASTER'

export interface UserProps {
    name: string;
    email: string;
    isOwnerOfEstablishment?: boolean;
    avatar?: string | null;
    password?: string;
    document?: string;
    deviceToken?: string;
    isActive: boolean;
    resetToken?: string;
    stripeAccountId?: string;
    stripeCustomerId?: string;
    phone?: string;
    birthDate?: Date;
    type: AccountRole;
    createdAt: Date;
    updatedAt: Date;
}

export class User {
    uid: string;
    private props: UserProps;

    constructor(props: Replace<UserProps, { createdAt?: Date, updatedAt?: Date }>, id?: string) {
        this.uid = id ?? randomUUID()
        this.props = {
            ...props,
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date()
        }
    }

    public get id(): string {
        return this.uid;
    }

    public set name(name: string) {
        this.props.name = name
    }

    public get name(): string {
        return this.props.name;
    }

    public set email(email: string) {
        this.props.email = email
    }

    public get email(): string {
        return this.props.email;
    }

    public set stripeAccountId(stripeAccountId: string) {
        this.props.stripeAccountId = stripeAccountId
    }

    public get stripeAccountId(): string {
        return this.props.stripeAccountId;
    }

    public set stripeCustomerId(stripeCustomerId: string) {
        this.props.stripeCustomerId = stripeCustomerId
    }

    public get stripeCustomerId(): string {
        return this.props.stripeCustomerId;
    }

    public get type(): string {
        return this.props.type;
    }

    public set password(password: string) {
        this.props.password = password
    }

    public get password(): string {
        return this.props.password;
    }

    public set avatar(avatar: string) {
        this.props.avatar = avatar
    }

    public get avatar(): string {
        return this.props.avatar;
    }

    public set document(document: string) {
        this.props.document = document
    }

    public get document(): string {
        return this.props.document;
    }

    public set resetToken(resetToken: string) {
        this.props.resetToken = resetToken
    }

    public get resetToken(): string {
        return this.props.resetToken;
    }

    public set deviceToken(deviceToken: string) {
        this.props.deviceToken = deviceToken
    }

    public get deviceToken(): string {
        return this.props.deviceToken;
    }

    public set isActive(isActive: boolean) {
        this.props.isActive = isActive
    }

    public get isActive(): boolean {
        return this.props.isActive;
    }

    public set isOwnerOfEstablishment(isOwnerOfEstablishment: boolean) {
        this.props.isOwnerOfEstablishment = isOwnerOfEstablishment
    }

    public get isOwnerOfEstablishment(): boolean {
        return this.props.isOwnerOfEstablishment;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }

    public set phone(phone: string) {
        this.props.phone = phone
    }

    public get phone(): string {
        return this.props.phone;
    }

    public set birthDate(birthDate: Date) {
        this.props.birthDate = birthDate
    }

    public get birthDate(): Date {
        return this.props.birthDate;
    }

}

