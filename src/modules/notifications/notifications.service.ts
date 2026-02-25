import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
        return await this.prisma.notification.create({
            data: createNotificationDto,
        }) as unknown as Notification;
    }

    async findAll(user: any, isRead?: boolean): Promise<{ data: Notification[]; meta: { total: number; unread: number } }> {
        const where: any = isRead !== undefined ? { isRead } : {};
        if (user.role === UserRole.ADMIN) {
            where.userId = user.id;
        }

        const [notifications, total, unread] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where }),
            this.prisma.notification.count({ where: { ...where, isRead: false } }),
        ]);

        return {
            data: notifications as unknown as Notification[],
            meta: {
                total,
                unread,
            },
        };
    }

    async findOne(id: string, user: any): Promise<Notification> {
        const notification = await this.prisma.notification.findUnique({
            where: { id },
        });

        if (!notification) {
            throw new NotFoundException(`Notification with ID "${id}" not found`);
        }

        if (user.role === UserRole.ADMIN && notification.userId !== user.id) {
            throw new ForbiddenException('You do not have permission to access this notification');
        }

        return notification as unknown as Notification;
    }

    async markAsRead(id: string, user: any): Promise<Notification> {
        await this.findOne(id, user); // Ensure existence and ownership

        return this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        }) as unknown as Notification;
    }

    async markAllAsRead(user: any): Promise<{ count: number }> {
        const where: any = { isRead: false };
        if (user.role === UserRole.ADMIN) {
            where.userId = user.id;
        }

        const result = await this.prisma.notification.updateMany({
            where,
            data: { isRead: true },
        });
        return { count: result.count };
    }

    async remove(id: string, user: any): Promise<void> {
        await this.findOne(id, user); // Ensure existence and ownership
        await this.prisma.notification.delete({
            where: { id },
        });
    }

    // Helper method to create reservation notifications
    async createReservationNotification(
        type: 'CREATED' | 'STATUS_CHANGED' | 'CANCELLED',
        reservationId: string,
        customerName: string,
        userId: number,
        status?: string,
    ): Promise<Notification> {
        const titles = {
            CREATED: 'Nouvelle réservation',
            STATUS_CHANGED: 'Statut modifié',
            CANCELLED: 'Réservation annulée',
        };

        const messages = {
            CREATED: `Une nouvelle réservation a été créée pour ${customerName}`,
            STATUS_CHANGED: `La réservation de ${customerName} est maintenant ${status}`,
            CANCELLED: `La réservation de ${customerName} a été annulée`,
        };

        return this.create({
            type: `RESERVATION_${type}`,
            title: titles[type],
            message: messages[type],
            userId,
            metadata: { reservationId, customerName, status },
        });
    }
}
