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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('products')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Create a new product' })
    @ApiResponse({ status: HttpStatus.CREATED, type: Product })
    create(@Body() createProductDto: CreateProductDto, @Request() req: any) {
        return this.productsService.create(createProductDto, req.user);
    }

    @Get()
    @ApiOperation({ summary: 'Get all active products' })
    @ApiResponse({ status: HttpStatus.OK, type: [Product] })
    @UseGuards(JwtAuthGuard) // Needed to get user for filtering if logged in
    findAll(@Request() req: any) {
        return this.productsService.findAll(req.user);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a product by id' })
    @ApiResponse({ status: HttpStatus.OK, type: Product })
    @UseGuards(JwtAuthGuard)
    findOne(@Param('id') id: string, @Request() req: any) {
        return this.productsService.findOne(id, req.user);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Update a product' })
    @ApiResponse({ status: HttpStatus.OK, type: Product })
    update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Request() req: any) {
        return this.productsService.update(id, updateProductDto, req.user);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Deactivate a product' })
    @ApiResponse({ status: HttpStatus.NO_CONTENT })
    remove(@Param('id') id: string, @Request() req: any) {
        return this.productsService.remove(id, req.user);
    }
}
