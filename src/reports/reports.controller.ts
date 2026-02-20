import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Obtener estadísticas del dashboard' })
  @ApiResponse({ status: 200, description: 'Estadísticas generales del sistema' })
  getDashboard() {
    return this.reportsService.getDashboardStats();
  }

  @Get('sales-by-product')
  @ApiOperation({ summary: 'Reporte de ventas por producto' })
  @ApiQuery({ name: 'startDate', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2025-01-11' })
  @ApiResponse({ status: 200, description: 'Ventas agrupadas por producto' })
  getSalesByProduct(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getSalesByProduct(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('sales-by-user')
  @ApiOperation({ summary: 'Reporte de ventas por usuario/cajero' })
  @ApiQuery({ name: 'startDate', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2025-01-11' })
  @ApiResponse({ status: 200, description: 'Ventas agrupadas por usuario' })
  getSalesByUser(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getSalesByUser(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('sales-by-payment-method')
  @ApiOperation({ summary: 'Reporte de ventas por método de pago' })
  @ApiQuery({ name: 'startDate', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2025-01-11' })
  @ApiResponse({ status: 200, description: 'Ventas agrupadas por método de pago' })
  getSalesByPaymentMethod(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getSalesByPaymentMethod(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('sales-by-period')
  @ApiOperation({ summary: 'Reporte de ventas por período' })
  @ApiQuery({ name: 'period', enum: ['day', 'week', 'month'], example: 'day' })
  @ApiQuery({ name: 'startDate', example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', example: '2025-01-11' })
  @ApiResponse({ status: 200, description: 'Ventas agrupadas por período' })
  getSalesByPeriod(
    @Query('period') period: 'day' | 'week' | 'month',
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getSalesByPeriod(
      period,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('best-selling-product')
  @ApiOperation({ summary: 'Producto más vendido (por cantidad)' })
  @ApiResponse({ status: 200, description: 'Producto con mayor cantidad vendida' })
  getBestSellingProduct() {
    return this.reportsService.getBestSellingProduct();
  }

  @Get('highest-revenue-product')
  @ApiOperation({ summary: 'Producto con mayor ingreso' })
  @ApiResponse({ status: 200, description: 'Producto que generó más ingresos' })
  getHighestRevenueProduct() {
    return this.reportsService.getHighestRevenueProduct();
  }
}