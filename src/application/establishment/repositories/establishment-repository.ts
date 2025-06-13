import { Establishment } from "../entity/Establishment";

export abstract class EstablishmentRepository {
    abstract create(establishment: Establishment): Promise<void>;
    abstract findByUserUid(uid: string): Promise<Establishment | null>;
    abstract findById(id: string): Promise<{establishment: Establishment, userOwner: any} | null>;
    abstract find(): Promise<Establishment[] | null>;
    abstract save(establishment: Establishment): Promise<void>;
}