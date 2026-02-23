import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReservationStatus } from '../../../common/enums';

export class UpdateReservationDto {
    @ApiProperty({ enum: ReservationStatus, required: false })
    @IsOptional()
    @IsEnum(ReservationStatus)
    status?: ReservationStatus;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}
