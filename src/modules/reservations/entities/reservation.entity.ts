import { ReservationStatus, Source } from '../../../common/enums';
import { Product } from '../../products/entities/product.entity';
import { Decimal } from '@prisma/client/runtime/library';

export class Reservation {
    id: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    product?: Product;
    quantity: number;
    unitPrice: Decimal;
    totalPrice: Decimal;
    status: ReservationStatus;
    source: Source;
    preferredDeliveryDate: Date;
    confirmedAt: Date;
    deliveredAt: Date;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
