import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ProductsService } from '../products/products.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ReservationStatus } from '../../common/enums';

@Injectable()
export class ReservationsService {
    constructor(
        private prisma: PrismaService,
        private readonly productsService: ProductsService,
        private readonly notificationsService: NotificationsService,
    ) { }

    async create(createReservationDto: CreateReservationDto): Promise<Reservation> {
        const product = await this.productsService.findOne(createReservationDto.productId);

        if (product.stock < createReservationDto.quantity) {
            throw new BadRequestException('Insufficient stock for this product');
        }

        // Calculate prices using Prisma Decimal
        const unitPrice = new Prisma.Decimal(product.price);
        const totalPrice = unitPrice.times(createReservationDto.quantity);

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
        });

        // Create notification
        await this.notificationsService.createReservationNotification(
            'CREATED',
            reservation.id,
            reservation.customerName,
        );

        return reservation;
    }

    async findAll(): Promise<Reservation[]> {
        return this.prisma.reservation.findMany({
            orderBy: { createdAt: 'desc' },
            include: { product: true },
        }) as unknown as Reservation[];
    }

    async findOne(id: string): Promise<Reservation> {
        const reservation = await this.prisma.reservation.findUnique({
            where: { id },
            include: { product: true },
        });
        if (!reservation) {
            throw new NotFoundException(`Reservation with ID "${id}" not found`);
        }
        return reservation as unknown as Reservation;
    }

    async update(id: string, updateReservationDto: UpdateReservationDto): Promise<Reservation> {
        const reservation = await this.findOne(id);
        const oldStatus = reservation.status;

        if (updateReservationDto.status === ReservationStatus.CANCELLED && reservation.status !== ReservationStatus.CANCELLED) {
            // Revert stock if cancelled
            const product = reservation.product;
            if (product) {
                await this.productsService.update(product.id, {
                    stock: product.stock + reservation.quantity,
                });
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
                );
            } else {
                await this.notificationsService.createReservationNotification(
                    'STATUS_CHANGED',
                    updatedReservation.id,
                    updatedReservation.customerName,
                    updateReservationDto.status,
                );
            }
        }

        return updatedReservation;
    }

    async remove(id: string): Promise<void> {
        console.log('ReservationsService.remove called for ID:', id);
        try {
            const reservation = await this.findOne(id);

            // Revert stock if not already cancelled
            if (reservation.status !== ReservationStatus.CANCELLED) {
                const product = reservation.product;
                if (product) {
                    await this.productsService.update(product.id, {
                        stock: product.stock + reservation.quantity,
                    });
                }
            }

            // Soft delete by setting status to CANCELLED
            await this.prisma.reservation.update({
                where: { id },
                data: { status: ReservationStatus.CANCELLED },
            });
            console.log('ReservationsService.remove success for ID:', id);
        } catch (error) {
            console.error('Error in ReservationsService.remove for ID:', id, error);
            throw error;
        }
    }

    async getStats() {
        const reservations = await this.prisma.reservation.findMany();
        const stats = {
            total: reservations.length,
            pending: reservations.filter(r => r.status === ReservationStatus.PENDING).length,
            confirmed: reservations.filter(r => r.status === ReservationStatus.CONFIRMED).length,
            cancelled: reservations.filter(r => r.status === ReservationStatus.CANCELLED).length,
            delivered: reservations.filter(r => r.status === ReservationStatus.DELIVERED).length,
            totalRevenue: reservations.reduce((acc, r) => acc + r.totalPrice.toNumber(), 0),
        };
        return stats;
    }
}
