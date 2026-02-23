import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @ApiProperty({ required: false, description: 'Whether the product is active' })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
