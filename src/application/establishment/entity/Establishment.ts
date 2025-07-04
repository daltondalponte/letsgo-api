import { randomUUID } from "crypto";
import { Replace } from "@helpers/Replace";

export interface Coord {
    latitude: number;
    longitude: number
}

export interface EstablishmentProps {
    name: string;
    address: string,
    userOwnerUid: string,
    coordinates: Coord,
    photos: string[],
    description?: string,
    contactPhone?: string,
    website?: string,
    socialMedia?: any,
    createdAt: Date,
    updatedAt: Date
}

export class Establishment {
    _id: string;
    private props: EstablishmentProps;

    constructor(props: Replace<EstablishmentProps, { createdAt?: Date, updatedAt?: Date }>, id?: string) {
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

    public set name(name: string) {
        this.props.name = name;
    }

    public get name(): string {
        return this.props.name;
    }

    public set address(address: string) {
        this.props.address = address;
    }

    public get address(): string {
        return this.props.address;
    }

    public set coord(coord: Coord) {
        this.props.coordinates = coord;
    }

    public get coord(): Coord {
        return this.props.coordinates;
    }


    public set userOwnerUid(userOwnerUid: string) {
        this.props.userOwnerUid = userOwnerUid;
    }

    public get userOwnerUid(): string {
        return this.props.userOwnerUid;
    }

    public set photos(photos: string[]) {
        this.props.photos = photos;
    }

    public get photos(): string[] {
        return this.props.photos;
    }

    public set description(description: string) {
        this.props.description = description;
    }

    public get description(): string {
        return this.props.description;
    }

    public set contactPhone(contactPhone: string) {
        this.props.contactPhone = contactPhone;
    }

    public get contactPhone(): string {
        return this.props.contactPhone;
    }

    public set website(website: string) {
        this.props.website = website;
    }

    public get website(): string {
        return this.props.website;
    }

    public set socialMedia(socialMedia: any) {
        this.props.socialMedia = socialMedia;
    }

    public get socialMedia(): any {
        return this.props.socialMedia;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }

}