import { Module } from '@nestjs/common';

import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';

@Module({
    imports: [],
    controllers: [ProductsController],
    providers: [ProductsService],
    exports: [ProductsService], // Exported for Reservations module
})
export class ProductsModule { }
