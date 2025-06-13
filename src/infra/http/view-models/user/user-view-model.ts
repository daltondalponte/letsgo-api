import { User } from "@application/user/entity/User";


export class UserViewModel {

    static toHTTP(user: User) {
        return {
            uid: user?.id,
            document: user?.document,
            name: user?.name,
            isOwnerOfEstablishment: user?.isOwnerOfEstablishment,
            isActive: user?.isActive,
            email: user?.email,
            avatar: user?.avatar,
            type: user?.type,
            createdAt: user?.createdAt,
            updatedAt: user?.updatedAt
        }
    }
}