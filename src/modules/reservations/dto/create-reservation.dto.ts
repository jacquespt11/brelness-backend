import { IsString, IsEmail, IsUUID, IsNumber, IsEnum, IsOptional, IsISO8601, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Source } from '../../../common/enums';

export class CreateReservationDto {
    @ApiProperty({ description: 'Customer full name' })
    @IsString()
    customerName: string;

    @ApiProperty({ description: 'Customer phone number' })
    @IsString()
    customerPhone: string;

    @ApiProperty({ description: 'Customer email address', required: false })
    @IsOptional()
    @IsEmail()
    customerEmail?: string;

    @ApiProperty({ description: 'UUID of the product' })
    @IsUUID()
    productId: string;

    @ApiProperty({ description: 'Quantity ordered' })
    @IsNumber()
    @Min(1)
    quantity: number;

    @ApiProperty({ required: false, description: 'Preferred delivery date (ISO)' })
    @IsOptional()
    @IsISO8601()
    preferredDeliveryDate?: string;

    @ApiProperty({ required: false, description: 'Additional notes' })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ enum: Source, description: 'Order source' })
    @IsEnum(Source)
    source: Source;
}
