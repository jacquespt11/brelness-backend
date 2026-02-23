// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';

import { User } from './entities/user.entity';
import { UsersService } from './users.service';

import { UsersController } from './users.controller';

@Module({
    imports: [],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
