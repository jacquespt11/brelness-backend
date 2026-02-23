import { Module } from '@nestjs/common';

import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { Reservation } from './entities/reservation.entity';
import { ProductsModule } from '../products/products.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        ProductsModule, // Imported to use ProductsService
        NotificationsModule, // Imported to create notifications
    ],
    controllers: [ReservationsController],
    providers: [ReservationsService],
})
export class ReservationsModule { }
