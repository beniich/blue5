import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User } from '@domain/entities/User';

export class PrismaUserRepository implements IUserRepository {
    constructor(private prisma: PrismaClient) { }

    async findById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({ where: { id } });
        return user ? this.toDomain(user) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        return user ? this.toDomain(user) : null;
    }

    async findAll(): Promise<User[]> {
        const users = await this.prisma.user.findMany();
        return users.map(this.toDomain);
    }

    async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                avatar: data.avatar,
                isActive: data.isActive,
                emailVerified: data.emailVerified,
                roleId: data.roleId,
            },
        });
        return this.toDomain(user);
    }

    async update(id: string, data: Partial<User>): Promise<User> {
        const user = await this.prisma.user.update({
            where: { id },
            data,
        });
        return this.toDomain(user);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.user.delete({ where: { id } });
    }

    private toDomain(prismaUser: any): User {
        return new User(
            prismaUser.id,
            prismaUser.email,
            prismaUser.password,
            prismaUser.firstName,
            prismaUser.lastName,
            prismaUser.phone,
            prismaUser.avatar,
            prismaUser.isActive,
            prismaUser.emailVerified,
            prismaUser.roleId,
            prismaUser.createdAt,
            prismaUser.updatedAt
        );
    }
}
