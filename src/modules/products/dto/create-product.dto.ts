import { IsString, IsNumber, IsEnum, IsOptional, IsUrl, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProductCategory } from '../../../common/enums';

export class CreateProductDto {
    @ApiProperty({ description: 'Name of the product' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Detailed description' })
    @IsString()
    description: string;

    @ApiProperty({ description: 'Price of the product' })
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty({ enum: ProductCategory, description: 'Product category' })
    @IsEnum(ProductCategory)
    category: ProductCategory;

    @ApiProperty({ required: false, description: 'URL to product image' })
    @IsOptional()
    @IsUrl()
    imageUrl?: string;

    @ApiProperty({ description: 'Current stock count' })
    @IsNumber()
    @Min(0)
    stock: number;
}
