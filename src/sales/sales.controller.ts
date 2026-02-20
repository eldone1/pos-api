import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Sales')
@Controller('sales')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva venta' })
  @ApiResponse({ status: 201, description: 'Venta creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Stock insuficiente o producto inactivo' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  create(@Body() createSaleDto: CreateSaleDto, @CurrentUser() user: User) {
    return this.salesService.create(createSaleDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las ventas' })
  @ApiResponse({ status: 200, description: 'Lista de ventas' })
  findAll() {
    return this.salesService.findAll();
  }

  @Get('stats/today')
  @ApiOperation({ summary: 'Estadísticas de ventas del día' })
  @ApiResponse({ status: 200, description: 'Total y cantidad de ventas del día' })
  getTodaySales() {
    return this.salesService.getTodaySales();
  }

  @Get('stats/total')
  @ApiOperation({ summary: 'Total de todas las ventas' })
  @ApiResponse({ status: 200, description: 'Total acumulado de ventas' })
  async getTotalSales() {
    const total = await this.salesService.getTotalSales();
    return { total };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Ventas de un usuario específico' })
  @ApiResponse({ status: 200, description: 'Ventas del usuario' })
  findByUser(@Param('userId') userId: string) {
    return this.salesService.findByUser(userId);
  }

  @Get('invoice/:invoiceNumber')
  @ApiOperation({ summary: 'Buscar venta por número de factura' })
  @ApiResponse({ status: 200, description: 'Venta encontrada' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  findByInvoiceNumber(@Param('invoiceNumber') invoiceNumber: string) {
    return this.salesService.findByInvoiceNumber(invoiceNumber);
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Ventas por rango de fechas' })
  @ApiQuery({ name: 'startDate', example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', example: '2025-01-11' })
  @ApiResponse({ status: 200, description: 'Ventas en el rango especificado' })
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.salesService.findByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una venta por ID' })
  @ApiResponse({ status: 200, description: 'Venta encontrada' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }
}