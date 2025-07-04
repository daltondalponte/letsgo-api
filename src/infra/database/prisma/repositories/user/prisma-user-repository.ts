import { User } from "@application/user/entity/User";
import * as bcrypt from "bcrypt";
import { UserRepository } from "@application/user/repositories/user-repository";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { PrismaUserMapper } from "../../mappers/user/prisma-user-mapper";
import { Establishment } from "@application/establishment/entity/Establishment";
import { PrismaEstablishmentMapper } from "../../mappers/establishment/prisma-establishment-mapper";
import { UserType } from "@prisma/client";

@Injectable()
export class PrismaUserRepository implements UserRepository {

    constructor(
        private prisma: PrismaService
    ) { }

    async saveResetToken(id: string, resetToken: string): Promise<void> {
        await this.prisma.user.update({
            where: {
                uid: id
            },
            data: {
                resetToken
            }
        })
    }

    async createRefreshToken(userId: string, token: string): Promise<void> {
        await this.prisma.refreshToken.create({
            data: {
                token,
                useruid: userId
            }
        })
    }

    async updateRefreshToken(userId: string, token: string): Promise<void> {
        await this.prisma.refreshToken.update({
            where: {
                useruid: userId
            },
            data: {
                token
            }

        })
    }

    async findByType(type: UserType): Promise<{ userData: { user: User; establishment: Establishment; }[] }> {
        const users = await this.prisma.user.findMany({
            where: {
                type
            },
            include: {
                Establishment: true
            },
            orderBy: {
                email: "asc"
            }
        })

        const userData = users.map(u => {
            return {
                user: PrismaUserMapper.toDomain(u),
                establishment: PrismaEstablishmentMapper.toDomain(u.Establishment[0])
            }
        })

        return { userData }
    }

    async findAll(): Promise<User[]> {
        const users = await this.prisma.user.findMany({
            include: {
                Establishment: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return users.map(PrismaUserMapper.toDomain);
    }

    async findAllWithEstablishments(): Promise<{
        userData: {
            user: User,
            establishment: Establishment | null
        }[]
    }> {
        const users = await this.prisma.user.findMany({
            include: {
                Establishment: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const userData = users.map(u => ({
            user: PrismaUserMapper.toDomain(u),
            establishment: u.Establishment[0] ? PrismaEstablishmentMapper.toDomain(u.Establishment[0]) : null
        }));

        return { userData };
    }

    async findRefreshTokenByUserId(userId: string): Promise<string> {
        const refreshToken = await this.prisma.refreshToken.findUnique({
            where: {
                useruid: userId
            }
        })

        if (!refreshToken) {
            return null
        }

        return refreshToken.token
    }

    async create(user: User): Promise<void> {
        user.password = await bcrypt.hash(user.password, 10)
        const rawUser = PrismaUserMapper.toPrisma(user)

        await this.prisma.user.create({
            data: rawUser
        })
    }

    async findByEmail(email: string): Promise<{ user: User, establishment: Establishment | null } | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                email
            },
            include: {
                Establishment: true
            }
        })

        if (!user) return null

        const userDomain = PrismaUserMapper.toDomain(user)
        const establishmentDomain = user.Establishment[0] ? PrismaEstablishmentMapper.toDomain(user.Establishment[0]) : null
        return { user: userDomain, establishment: establishmentDomain }
    }

    async delete(id: string): Promise<void> {
        await this.prisma.user.delete({
            where: {
                uid: id
            }
        })
    }

    async findById(id: string): Promise<{ user: User, establishment: Establishment | null } | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                uid: id
            },
            include: {
                Establishment: true
            }
        })

        const userDomain = PrismaUserMapper.toDomain(user)
        const establishmentDomain = user.Establishment[0] ? PrismaEstablishmentMapper.toDomain(user.Establishment[0]) : null
        return { user: userDomain, establishment: establishmentDomain }
    }

    async save(data: any): Promise<void> {
        let where: any = {}

        if (data?.uid) {
            where.uid = data.uid
        } else {
            where.email = data.email
        }
        await this.prisma.user.update({
            where: where,
            data
        })

    }

}
