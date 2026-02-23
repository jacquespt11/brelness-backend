import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
        console.log('NotificationsService.create called with:', createNotificationDto);
        try {
            return await this.prisma.notification.create({
                data: createNotificationDto,
            }) as unknown as Notification;
        } catch (error) {
            console.error('Error in NotificationsService.create:', error);
            throw error;
        }
    }

    async findAll(isRead?: boolean): Promise<{ data: Notification[]; meta: { total: number; unread: number } }> {
        const where = isRead !== undefined ? { isRead } : {};

        const [notifications, total, unread] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where }),
            this.prisma.notification.count({ where: { isRead: false } }),
        ]);

        return {
            data: notifications as unknown as Notification[],
            meta: {
                total,
                unread,
            },
        };
    }

    async findOne(id: string): Promise<Notification> {
        const notification = await this.prisma.notification.findUnique({
            where: { id },
        });

        if (!notification) {
            throw new NotFoundException(`Notification with ID "${id}" not found`);
        }

        return notification as unknown as Notification;
    }

    async markAsRead(id: string): Promise<Notification> {
        await this.findOne(id);

        return this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        }) as unknown as Notification;
    }

    async markAllAsRead(): Promise<{ count: number }> {
        console.log('NotificationsService.markAllAsRead called');
        try {
            const result = await this.prisma.notification.updateMany({
                where: { isRead: false },
                data: { isRead: true },
            });
            console.log('markAllAsRead result:', result);
            return { count: result.count };
        } catch (error) {
            console.error('Error in NotificationsService.markAllAsRead:', error);
            throw error;
        }
    }

    async remove(id: string): Promise<void> {
        await this.findOne(id);
        await this.prisma.notification.delete({
            where: { id },
        });
    }

    // Helper method to create reservation notifications
    async createReservationNotification(
        type: 'CREATED' | 'STATUS_CHANGED' | 'CANCELLED',
        reservationId: string,
        customerName: string,
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
            metadata: { reservationId, customerName, status },
        });
    }
}
