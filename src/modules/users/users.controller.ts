import { Controller, Get, Patch, Post, Delete, Param, Body, UseGuards, Query, Request, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get all users (optionally filtered by role)' })
    @ApiQuery({ name: 'role', enum: UserRole, required: false })
    @ApiResponse({ status: 200, type: [User] })
    findAll(@Query('role') role?: UserRole) {
        return this.usersService.findAll(role);
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Create a new user (Super Admin only)' })
    @ApiResponse({ status: 201, type: User })
    create(@Body() dto: CreateUserDto) {
        return this.usersService.create(dto);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Update a user (Super Admin only)' })
    @ApiResponse({ status: 200, type: User })
    update(@Param('id') id: string, @Body() dto: Partial<CreateUserDto>) {
        return this.usersService.update(parseInt(id), dto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Delete a user (Super Admin only)' })
    @ApiResponse({ status: 204 })
    async remove(@Param('id') id: string) {
        await this.usersService.remove(parseInt(id));
    }

    @Get('me')
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: HttpStatus.OK, type: User })
    getMe(@Request() req: any) {
        return this.usersService.findById(req.user.id);
    }

    @Patch('me')
    @ApiOperation({ summary: 'Update current user profile (name, phone)' })
    @ApiResponse({ status: HttpStatus.OK, type: User })
    updateMe(@Request() req: any, @Body() dto: UpdateProfileDto) {
        return this.usersService.updateMe(req.user.id, dto);
    }

    @Patch('me/password')
    @ApiOperation({ summary: 'Change current user password' })
    @ApiResponse({ status: HttpStatus.OK })
    changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
        return this.usersService.changePassword(req.user.id, dto);
    }
}
