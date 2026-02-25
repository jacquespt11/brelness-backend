import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpStatus,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Reservation } from './entities/reservation.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('reservations')
@Controller('reservations')
export class ReservationsController {
    constructor(private readonly reservationsService: ReservationsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new reservation' })
    @ApiResponse({ status: HttpStatus.CREATED, type: Reservation })
    @UseGuards(JwtAuthGuard) // Needed to associate reservation with an admin if they are logged in.
    create(@Body() createReservationDto: CreateReservationDto, @Request() req: any) {
        return this.reservationsService.create(createReservationDto, req.user);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get all reservations' })
    @ApiResponse({ status: HttpStatus.OK, type: [Reservation] })
    findAll(@Request() req: any) {
        return this.reservationsService.findAll(req.user);
    }

    @Get('stats')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get reservation statistics' })
    @ApiResponse({ status: HttpStatus.OK })
    getStats(@Request() req: any) {
        return this.reservationsService.getStats(req.user);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a reservation by id' })
    @ApiResponse({ status: HttpStatus.OK, type: Reservation })
    @UseGuards(JwtAuthGuard)
    findOne(@Param('id') id: string, @Request() req: any) {
        return this.reservationsService.findOne(id, req.user);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Update a reservation status or notes' })
    @ApiResponse({ status: HttpStatus.OK, type: Reservation })
    update(
        @Param('id') id: string,
        @Body() updateReservationDto: UpdateReservationDto,
        @Request() req: any,
    ) {
        return this.reservationsService.update(id, updateReservationDto, req.user);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Delete a reservation (soft delete)' })
    @ApiResponse({ status: HttpStatus.NO_CONTENT })
    remove(@Param('id') id: string, @Request() req: any) {
        return this.reservationsService.remove(id, req.user);
    }
}
