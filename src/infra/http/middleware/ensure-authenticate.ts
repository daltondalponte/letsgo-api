import { PrismaService } from '@infra/database/prisma/prisma.service';
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response, NextFunction } from 'express';

@Injectable()
export class EnsureAdminMiddleware implements NestMiddleware {

    constructor(
        private prisma: PrismaService
    ) { }

    async use(req, res: Response, next: NextFunction) {
        try {

            const [, token] = req.headers['authorization'].split(" ")

            const jwtService = new JwtService()

            const payload = jwtService.verify(token, { secret: process.env.JWT_SECRET })

            if (!payload || !payload?.sub) throw new UnauthorizedException("Acesso negado.")

            const userRole = await this.prisma.userRole.findMany({
                where: {
                    useruid: payload?.sub
                },
                include: {
                    role: true
                }
            })

            const isAdmin = userRole.some(user => user.role.name === "ADMIN")
console.log("isAdmin", isAdmin, userRole)
            if (!isAdmin) throw new UnauthorizedException("Acesso negado.")

            next();

        } catch (e) {
            throw new UnauthorizedException(`Acesso negado.`)
        }
    }
}
