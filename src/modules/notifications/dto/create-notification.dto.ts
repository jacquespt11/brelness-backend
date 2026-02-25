import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateNotificationDto {
    @ApiProperty({ example: 'RESERVATION_CREATED' })
    @IsString()
    type: string;

    @ApiProperty({ example: 'Nouvelle réservation' })
    @IsString()
    title: string;

    @ApiProperty({ example: 'Une nouvelle réservation a été créée pour Marie Dupont' })
    @IsString()
    message: string;

    @ApiProperty({ required: false, example: { reservationId: 'abc-123' } })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;

    @ApiProperty()
    @IsOptional() // Should be provided internally but mark as optional for DTO validation if needed
    userId: number;
}
