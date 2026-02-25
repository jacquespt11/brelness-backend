import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async create(createProductDto: CreateProductDto, user: any): Promise<Product> {
        return this.prisma.product.create({
            data: {
                ...createProductDto,
                userId: user.id,
            } as any
        }) as unknown as Product;
    }

    async findAll(user?: any): Promise<Product[]> {
        const where: any = { isActive: true };

        // If user is ADMIN, only show their products. 
        // If no user (public view) or SUPER_ADMIN, show all.
        if (user && user.role === UserRole.ADMIN) {
            where.userId = user.id;
        }

        return this.prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        }) as unknown as Product[];
    }

    async findOne(id: string, user?: any): Promise<Product> {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) {
            throw new NotFoundException(`Product with ID "${id}" not found`);
        }

        // Ownership check for ADMIN
        if (user && user.role === UserRole.ADMIN && product.userId !== user.id) {
            throw new ForbiddenException('You do not have permission to access this product');
        }

        return product as unknown as Product;
    }

    async update(id: string, updateProductDto: UpdateProductDto, user: any): Promise<Product> {
        await this.findOne(id, user); // Ensure existence and ownership
        return this.prisma.product.update({
            where: { id },
            data: updateProductDto as any,
        }) as unknown as Product;
    }

    async remove(id: string, user: any): Promise<void> {
        await this.findOne(id, user); // Ensure existence and ownership
        await this.prisma.product.update({
            where: { id },
            data: { isActive: false },
        });
    }
}
