// src/seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './modules/users/users.service';
import { UserRole } from './modules/users/entities/user.entity';
import { PrismaService } from './prisma.service';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersService = app.get(UsersService);

    const password = 'Password123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Super Admin
    const superAdminEmail = 'superadmin@brelness.com';
    const existingSuperAdmin = await usersService.findByEmail(superAdminEmail);
    if (!existingSuperAdmin) {
        await usersService.create({
            email: superAdminEmail,
            password: hashedPassword,
            role: UserRole.SUPER_ADMIN,
        });
        console.log('Super Admin created: superadmin@brelness.com / Password123!');
    } else {
        console.log('Super Admin already exists');
    }

    // Create Admin
    const adminEmail = 'admin@brelness.com';
    const existingAdmin = await usersService.findByEmail(adminEmail);
    let adminId: number;

    if (!existingAdmin) {
        const admin = await usersService.create({
            email: adminEmail,
            password: hashedPassword,
            role: UserRole.ADMIN,
        });
        adminId = (admin as any).id;
        console.log('Admin created: admin@brelness.com / Password123!');
    } else {
        adminId = existingAdmin.id;
        console.log('Admin already exists');
    }

    // Create Initial Products
    const prisma = app.get(PrismaService);
    const productsCount = await prisma.product.count();

    if (productsCount === 0) {
        const { ProductCategory } = await import('@prisma/client');
        const initialProducts = [
            {
                name: 'Lait Monganga',
                description: 'Lait corporel hydratant intense',
                price: 15.50,
                category: ProductCategory.BODY_CARE,
                stock: 18,
                imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=400',
                userId: adminId,
            },
            {
                name: 'Sérum Oxalia',
                description: 'Sérum éclat visage bio',
                price: 24.90,
                category: ProductCategory.FACIAL_CARE,
                stock: 24,
                imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400',
                userId: adminId,
            },
            {
                name: 'Coco Channel',
                description: 'Parfum de luxe édition limitée',
                price: 85.00,
                category: ProductCategory.PERFUME,
                stock: 31,
                imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=400',
                userId: adminId,
            }
        ];

        for (const product of initialProducts) {
            await prisma.product.create({ data: product });
        }
        console.log(`${initialProducts.length} initial products created`);
    } else {
        console.log('Products already exist in database');
    }

    await app.close();
}

bootstrap();
