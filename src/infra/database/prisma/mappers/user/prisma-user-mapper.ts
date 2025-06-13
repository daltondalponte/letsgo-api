import { User } from "@application/user/entity/User";
import { UserType, User as RawUser } from "@prisma/client";


export class PrismaUserMapper {
    static toPrisma(user: User) {
        return {
            uid: user.id,
            name: user.name,
            email: user.email,
            password: user.password,
            avatar: user.avatar,
            isOwnerOfEstablishment: user.isOwnerOfEstablishment,
            stripeAccountId: user.stripeAccountId,
            stripeCustomerId: user.stripeCustomerId,
            document: user.document,
            deviceToken: user.deviceToken,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            isActive: user.isActive,
            type: UserType[user.type]
        }
    }

    static toDomain(rawUser: RawUser) {
        return new User({
            email: rawUser.email,
            password: rawUser.password,
            isActive: rawUser.isActive,
            avatar: rawUser.avatar,
            stripeAccountId: rawUser.stripeAccountId,
            resetToken: rawUser.resetToken,
            document: rawUser.document,
            stripeCustomerId: rawUser.stripeCustomerId,
            isOwnerOfEstablishment: rawUser.isOwnerOfEstablishment,
            deviceToken: rawUser.deviceToken,
            name: rawUser.name,
            type: rawUser.type,
            createdAt: rawUser.createdAt,
            updatedAt: rawUser.updatedAt
        }, rawUser.uid)
    }
}