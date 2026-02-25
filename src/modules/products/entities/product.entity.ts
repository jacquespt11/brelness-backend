import { ProductCategory } from '../../../common/enums';
// We'll import Reservation entity once created to avoid circular dep issues during creation
import { Reservation } from '../../reservations/entities/reservation.entity';
import { Decimal } from '@prisma/client/runtime/library';

export class Product {
    id: string;
    name: string;
    description: string;
    price: Decimal;
    category: ProductCategory;
    imageUrl: string;
    stock: number;
    isActive: boolean;
    userId: number; // Added for multi-tenancy
    createdAt: Date;
    updatedAt: Date;
    reservations?: Reservation[];
}
