// src/modules/users/entities/user.entity.ts
export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
}

export class User {
    id: number;
    email: string;
    password: string;
    name?: string;
    phone?: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}
