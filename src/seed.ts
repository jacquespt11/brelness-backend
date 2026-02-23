// src/seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './modules/users/users.service';
import { UserRole } from './modules/users/entities/user.entity';
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
    if (!existingAdmin) {
        await usersService.create({
            email: adminEmail,
            password: hashedPassword,
            role: UserRole.ADMIN,
        });
        console.log('Admin created: admin@brelness.com / Password123!');
    } else {
        console.log('Admin already exists');
    }

    await app.close();
}

bootstrap();
