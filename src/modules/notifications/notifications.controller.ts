import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './entities/notification.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a notification (internal use)' })
    @ApiResponse({ status: HttpStatus.CREATED, type: Notification })
    create(@Body() createNotificationDto: CreateNotificationDto) {
        return this.notificationsService.create(createNotificationDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all notifications' })
    @ApiQuery({ name: 'isRead', required: false, type: Boolean })
    @ApiResponse({ status: HttpStatus.OK })
    findAll(@Query('isRead') isRead?: string) {
        const isReadBool = isRead === 'true' ? true : isRead === 'false' ? false : undefined;
        return this.notificationsService.findAll(isReadBool);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a notification by id' })
    @ApiResponse({ status: HttpStatus.OK, type: Notification })
    findOne(@Param('id') id: string) {
        return this.notificationsService.findOne(id);
    }

    @Patch('read-all')
    @ApiOperation({ summary: 'Mark all notifications as read' })
    @ApiResponse({ status: HttpStatus.OK })
    markAllAsRead() {
        return this.notificationsService.markAllAsRead();
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark notification as read' })
    @ApiResponse({ status: HttpStatus.OK, type: Notification })
    markAsRead(@Param('id') id: string) {
        return this.notificationsService.markAsRead(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a notification' })
    @ApiResponse({ status: HttpStatus.NO_CONTENT })
    remove(@Param('id') id: string) {
        return this.notificationsService.remove(id);
    }
}
