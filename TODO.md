# Migration to Prisma and Adding Authentication/RBAC

## Steps to Complete

- [ ] Install Prisma dependencies and remove TypeORM from package.json
- [ ] Create schema.prisma with User, Product, Reservation models
- [ ] Create prisma.service.ts for database connectivity
- [ ] Update app.module.ts to replace TypeOrmModule with PrismaModule
- [ ] Migrate src/modules/users/users.service.ts to use PrismaClient
- [ ] Update src/modules/auth/auth.service.ts to ensure role inclusion in JWT payload
- [ ] Migrate src/modules/products/products.service.ts to use PrismaClient
- [ ] Migrate src/modules/reservations/reservations.service.ts to use PrismaClient
- [x] Run npx prisma generate
- [x] Run npx prisma migrate dev
- [x] Test the migration by running the app and verifying endpoints
