// src/modules/users/users.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { User, UserRole } from './entities/user.entity';
import { Prisma } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        }) as unknown as User;
    }

    async findById(id: number): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
        }) as unknown as User;
    }

    async findAll(role?: UserRole): Promise<User[]> {
        const where = role ? { role } : {};
        return this.prisma.user.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        }) as unknown as User[];
    }

    async create(userData: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({
            data: userData,
        }) as unknown as User;
    }

    async updateMe(userId: number, dto: UpdateProfileDto): Promise<Omit<User, 'password'>> {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...(dto.name !== undefined ? { name: dto.name } : {}),
                ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
            },
            select: { id: true, email: true, role: true, name: true, phone: true, createdAt: true },
        });

        return updated as unknown as Omit<User, 'password'>;
    }

    async changePassword(userId: number, dto: ChangePasswordDto): Promise<{ message: string }> {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        // Verify current password
        if (!user.password) throw new BadRequestException('No password set for this account');
        const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
        if (!isMatch) throw new BadRequestException('Mot de passe actuel incorrect');

        const hashed = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashed },
        });

        return { message: 'Mot de passe modifié avec succès' };
    }
}
