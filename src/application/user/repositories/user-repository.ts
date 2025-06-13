import { Establishment } from "@application/establishment/entity/Establishment";
import { User } from "../entity/User";
import { UserType } from "@prisma/client";

export abstract class UserRepository {
    abstract create(user: User): Promise<void>;
    abstract findByEmail(email: string): Promise<{ user: User, establishment: Establishment } | null>;
    abstract findByType(type: UserType): Promise<{
        userData: {
            user: User,
            establishment: Establishment
        }[]
    } | null>;
    abstract findAll(): Promise<User[]>; // Novo método para a Dashboard Master
    abstract saveResetToken(id: string, resetToken: string): Promise<void>;
    abstract findById(id: string): Promise<{ user: User, establishment: Establishment } | null>;
    abstract createRefreshToken(userId: string, token: string): Promise<void>;
    abstract updateRefreshToken(userId: string, token: string): Promise<void>;
    abstract findRefreshTokenByUserId(userId: string): Promise<string>;
    abstract save(data: any): Promise<void>;
    abstract delete(id: string): Promise<void>;
}
