// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Connexion utilisateur' })
    @ApiResponse({ status: 200, description: 'Connexion réussie' })
    @ApiResponse({ status: 401, description: 'Identifiants invalides' })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }
}
