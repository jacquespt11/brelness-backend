import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
    @ApiProperty()
    @IsEmail({}, { message: 'Email invalide' })
    email: string;

    @ApiProperty()
    @IsString()
    @MinLength(6, { message: 'Le mot de passe doit faire au moins 6 caractères' })
    password: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ enum: UserRole })
    @IsEnum(UserRole, { message: 'Rôle invalide' })
    role: UserRole;
}
