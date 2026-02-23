import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async create(createProductDto: CreateProductDto): Promise<Product> {
        return this.prisma.product.create({
            data: {
                ...createProductDto,
                // stock is not in dto? default 0 in entity/prisma
                // category default OTHER
            } as any
        }) as unknown as Product;
    }

    async findAll(): Promise<Product[]> {
        return this.prisma.product.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        }) as unknown as Product[];
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) {
            throw new NotFoundException(`Product with ID "${id}" not found`);
        }
        return product as unknown as Product;
    }

    async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
        await this.findOne(id); // Ensure existence
        return this.prisma.product.update({
            where: { id },
            data: updateProductDto as any,
        }) as unknown as Product;
    }

    async remove(id: string): Promise<void> {
        await this.findOne(id);
        await this.prisma.product.update({
            where: { id },
            data: { isActive: false },
        });
    }
}
