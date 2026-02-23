
import { PrismaClient } from '@prisma/client';

async function checkStock() {
    const prisma = new PrismaClient();
    try {
        const products = await prisma.product.findMany({
            select: { id: true, name: true, stock: true, isActive: true }
        });
        console.log('PRODUCTS_STOCK:', products);
    } catch (error) {
        console.error('DATABASE_ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkStock();
