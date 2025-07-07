import { randomUUID } from "crypto";
import { Replace } from "@helpers/Replace";

export interface Coord  {
    latitude: number;
    longitude: number
}

export interface EventProps {
    name: string;
    address?: string,
    useruid?: string,
    coordinates_event?: Coord,
    establishmentId?: string,
    dateTimestamp: string,
    endTimestamp?: string,
    description: string,
    ticketTakers?: string[],
    listNames?: string[],
    photos: string[],
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date
}

export class Event {
    _id: string;
    private props: EventProps;

    constructor(props: Replace<EventProps, { createdAt?: Date, updatedAt?: Date }>, id?: string) {
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
        this.props.coordinates_event = coord;
    }

    public get coord(): Coord {
        return this.props.coordinates_event;
    }

    public set dateTimestamp(dateTimestamp: string) {
        this.props.dateTimestamp = dateTimestamp;
    }

    public get dateTimestamp(): string {
        return this.props.dateTimestamp;
    }

    public set endTimestamp(endTimestamp: string) {
        this.props.endTimestamp = endTimestamp;
    }

    public get endTimestamp(): string {
        return this.props.endTimestamp;
    }

    public set description(description: string) {
        this.props.description = description;
    }

    public get description(): string {
        return this.props.description;
    }

    public set isActive(isActive: boolean) {
        this.props.isActive = isActive;
    }

    public get isActive(): boolean {
        return this.props.isActive;
    }

    public set useruid(useruid: string) {
        this.props.useruid = useruid;
    }

    public get useruid(): string {
        return this.props.useruid;
    }

    public set establishmentId(establishmentId: string) {
        this.props.establishmentId = establishmentId;
    }

    public get establishmentId(): string {
        return this.props.establishmentId;
    }

    public set photos(photos: string[]) {
        this.props.photos = photos;
    }

    public get photos(): string[] {
        return this.props.photos;
    }

    public set ticketTakers(ticketTakers: string[]) {
        this.props.ticketTakers = ticketTakers;
    }

    public get ticketTakers(): string[] {
        return this.props.ticketTakers;
    }

    public set listNames(listNames: string[]) {
        this.props.listNames = listNames;
    }

    public get listNames(): string[] {
        return this.props.listNames;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }

}