import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ProductsService } from '../products/products.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ReservationStatus } from '../../common/enums';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class ReservationsService {
    constructor(
        private prisma: PrismaService,
        private readonly productsService: ProductsService,
        private readonly notificationsService: NotificationsService,
    ) { }

    async create(createReservationDto: CreateReservationDto, user?: any): Promise<Reservation> {
        const product = await this.productsService.findOne(createReservationDto.productId);

        if (product.stock < createReservationDto.quantity) {
            throw new BadRequestException('Insufficient stock for this product');
        }

        // Calculate prices using Prisma Decimal
        const unitPrice = new Prisma.Decimal(product.price);
        const totalPrice = unitPrice.times(createReservationDto.quantity);

        // If an admin is creating the reservation, they own it.
        // If a client (public) is creating it, it belongs to the product owner.
        const ownerId = user ? user.id : (product as any).userId;

        const reservation = await this.prisma.reservation.create({
            data: {
                customerName: createReservationDto.customerName,
                customerPhone: createReservationDto.customerPhone,
                customerEmail: createReservationDto.customerEmail || null,
                productId: createReservationDto.productId,
                quantity: createReservationDto.quantity,
                unitPrice,
                totalPrice,
                status: ReservationStatus.PENDING,
                source: createReservationDto.source,
                userId: ownerId,
                ...(createReservationDto.preferredDeliveryDate
                    ? { preferredDeliveryDate: new Date(createReservationDto.preferredDeliveryDate) }
                    : {}),
                ...(createReservationDto.notes ? { notes: createReservationDto.notes } : {}),
            },
            include: { product: true },
        }) as unknown as Reservation;

        // Update product stock
        await this.productsService.update(product.id, {
            stock: product.stock - createReservationDto.quantity,
        }, user || { id: ownerId, role: UserRole.ADMIN }); // Use override user if public

        // Create notification for the owner
        await this.notificationsService.createReservationNotification(
            'CREATED',
            reservation.id,
            reservation.customerName,
            reservation.userId,
        );

        return reservation;
    }

    async findAll(user: any): Promise<Reservation[]> {
        const where: any = {};
        if (user.role === UserRole.ADMIN) {
            where.userId = user.id;
        }

        return this.prisma.reservation.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { product: true },
        }) as unknown as Reservation[];
    }

    async findOne(id: string, user?: any): Promise<Reservation> {
        const reservation = await this.prisma.reservation.findUnique({
            where: { id },
            include: { product: true },
        });
        if (!reservation) {
            throw new NotFoundException(`Reservation with ID "${id}" not found`);
        }

        // Si user est présent et est ADMIN, vérifier qu'il est propriétaire
        if (user && user.role === UserRole.ADMIN && reservation.userId !== user.id) {
            throw new ForbiddenException('You do not have permission to access this reservation');
        }

        return reservation as unknown as Reservation;
    }

    async update(id: string, updateReservationDto: UpdateReservationDto, user: any): Promise<Reservation> {
        const reservation = await this.findOne(id, user); // Ensure existence and ownership
        const oldStatus = reservation.status;

        if (updateReservationDto.status === ReservationStatus.CANCELLED && reservation.status !== ReservationStatus.CANCELLED) {
            // Revert stock if cancelled
            const product = reservation.product;
            if (product) {
                await this.productsService.update(product.id, {
                    stock: product.stock + reservation.quantity,
                }, user);
            }
        }

        const updateData: any = { ...updateReservationDto };

        if (updateReservationDto.status === ReservationStatus.CONFIRMED) {
            updateData.confirmedAt = new Date();
        }

        if (updateReservationDto.status === ReservationStatus.DELIVERED) {
            updateData.deliveredAt = new Date();
        }

        const updatedReservation = await this.prisma.reservation.update({
            where: { id },
            data: updateData,
            include: { product: true },
        }) as unknown as Reservation;

        // Create notification if status changed
        if (updateReservationDto.status && updateReservationDto.status !== oldStatus) {
            if (updateReservationDto.status === ReservationStatus.CANCELLED) {
                await this.notificationsService.createReservationNotification(
                    'CANCELLED',
                    updatedReservation.id,
                    updatedReservation.customerName,
                    updatedReservation.userId,
                );
            } else {
                await this.notificationsService.createReservationNotification(
                    'STATUS_CHANGED',
                    updatedReservation.id,
                    updatedReservation.customerName,
                    updatedReservation.userId,
                    updateReservationDto.status,
                );
            }
        }

        return updatedReservation;
    }

    async remove(id: string, user: any): Promise<void> {
        try {
            const reservation = await this.findOne(id, user); // Ensure existence and ownership

            // Revert stock if not already cancelled
            if (reservation.status !== ReservationStatus.CANCELLED) {
                const product = reservation.product;
                if (product) {
                    await this.productsService.update(product.id, {
                        stock: product.stock + reservation.quantity,
                    }, user);
                }
            }

            // Soft delete by setting status to CANCELLED
            await this.prisma.reservation.update({
                where: { id },
                data: { status: ReservationStatus.CANCELLED },
            });
        } catch (error) {
            console.error('Error in ReservationsService.remove for ID:', id, error);
            throw error;
        }
    }

    async getStats(user: any) {
        const where: any = {};
        if (user.role === UserRole.ADMIN) {
            where.userId = user.id;
        }

        const reservations = await this.prisma.reservation.findMany({ where });
        const stats = {
            total: reservations.length,
            pending: reservations.filter(r => r.status === ReservationStatus.PENDING).length,
            confirmed: reservations.filter(r => r.status === ReservationStatus.CONFIRMED).length,
            cancelled: reservations.filter(r => r.status === ReservationStatus.CANCELLED).length,
            delivered: reservations.filter(r => r.status === ReservationStatus.DELIVERED).length,
            totalRevenue: reservations.reduce((acc, r) => {
                const price = r.totalPrice && typeof (r.totalPrice as any).toNumber === 'function'
                    ? r.totalPrice.toNumber()
                    : Number(r.totalPrice) || 0;
                return acc + price;
            }, 0),
        };
        return stats;
    }
}
