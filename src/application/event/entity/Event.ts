export interface Coord {
    latitude: number;
    longitude: number;
}

interface EventProps {
    id?: string;
    name: string;
    dateTimestamp: Date;
    endTimestamp?: Date;
    description: string;
    photos: string[];
    listNames?: string[];
    address?: string;
    establishmentId?: string;
    useruid?: string;
    isActive: boolean;
    coordinates_event?: Coord;
}

export class Event {
    private props: EventProps;

    constructor(props: EventProps) {
        this.props = props;
    }

    public get id(): string | undefined {
        return this.props.id;
    }

    public set id(id: string) {
        this.props.id = id;
    }

    public set name(name: string) {
        this.props.name = name;
    }

    public get name(): string {
        return this.props.name;
    }

    public set dateTimestamp(dateTimestamp: Date) {
        this.props.dateTimestamp = dateTimestamp;
    }

    public get dateTimestamp(): Date {
        return this.props.dateTimestamp;
    }

    public set endTimestamp(endTimestamp: Date | undefined) {
        this.props.endTimestamp = endTimestamp;
    }

    public get endTimestamp(): Date | undefined {
        return this.props.endTimestamp;
    }

    public set description(description: string) {
        this.props.description = description;
    }

    public get description(): string {
        return this.props.description;
    }

    public set photos(photos: string[]) {
        this.props.photos = photos;
    }

    public get photos(): string[] {
        return this.props.photos;
    }

    public set listNames(listNames: string[] | undefined) {
        this.props.listNames = listNames;
    }

    public get listNames(): string[] | undefined {
        return this.props.listNames;
    }

    public set address(address: string | undefined) {
        this.props.address = address;
    }

    public get address(): string | undefined {
        return this.props.address;
    }

    public set establishmentId(establishmentId: string | undefined) {
        this.props.establishmentId = establishmentId;
    }

    public get establishmentId(): string | undefined {
        return this.props.establishmentId;
    }

    public set useruid(useruid: string | undefined) {
        this.props.useruid = useruid;
    }

    public get useruid(): string | undefined {
        return this.props.useruid;
    }

    public set isActive(isActive: boolean) {
        this.props.isActive = isActive;
    }

    public get isActive(): boolean {
        return this.props.isActive;
    }

    public set coordinates_event(coordinates_event: Coord | undefined) {
        this.props.coordinates_event = coordinates_event;
    }

    public get coordinates_event(): Coord | undefined {
        return this.props.coordinates_event;
    }
}