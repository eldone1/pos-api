import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from '../sales/entities/sale.entity';
import { SaleDetail } from '../sales/entities/sale-detail.entity';
import { Product } from '../products/entities/product.entity';

export interface SalesByProduct {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
  salesCount: number;
}

export interface SalesByUser {
  userId: string;
  userName: string;
  userEmail: string;
  totalSales: number;
  totalRevenue: number;
}

export interface SalesByPaymentMethod {
  paymentMethod: string;
  count: number;
  total: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalSales: number;
  todayRevenue: number;
  todaySales: number;
  averageTicket: number;
  topProducts: SalesByProduct[];
  lowStockProducts: number;
  salesByPaymentMethod: SalesByPaymentMethod[];
}

export interface SalesByPeriod {
  period: string;
  totalSales: number;
  totalRevenue: number;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(SaleDetail)
    private readonly saleDetailRepository: Repository<SaleDetail>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // Reporte: Ventas por producto
  async getSalesByProduct(
    startDate?: Date,
    endDate?: Date,
  ): Promise<SalesByProduct[]> {
    let query = this.saleDetailRepository
      .createQueryBuilder('detail')
      .leftJoin('detail.sale', 'sale')
      .select('detail.productId', 'productId')
      .addSelect('detail.productName', 'productName')
      .addSelect('SUM(detail.quantity)', 'totalQuantity')
      .addSelect('SUM(detail.subtotal)', 'totalRevenue')
      .addSelect('COUNT(DISTINCT sale.id)', 'salesCount')
      .groupBy('detail.productId')
      .addGroupBy('detail.productName')
      .orderBy('totalRevenue', 'DESC');

    if (startDate) {
      query = query.where('sale.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query = query.andWhere('sale.createdAt <= :endDate', { endDate });
    }

    const results = await query.getRawMany();

    return results.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      totalQuantity: parseInt(item.totalQuantity),
      totalRevenue: parseFloat(item.totalRevenue),
      salesCount: parseInt(item.salesCount),
    }));
  }

  // Reporte: Ventas por usuario/cajero
  async getSalesByUser(startDate?: Date, endDate?: Date): Promise<SalesByUser[]> {
    let query = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoin('sale.user', 'user')
      .select('user.id', 'userId')
      .addSelect('user.name', 'userName')
      .addSelect('user.email', 'userEmail')
      .addSelect('COUNT(sale.id)', 'totalSales')
      .addSelect('SUM(sale.total)', 'totalRevenue')
      .groupBy('user.id')
      .addGroupBy('user.name')
      .addGroupBy('user.email')
      .orderBy('totalRevenue', 'DESC');

    if (startDate) {
      query = query.where('sale.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query = query.andWhere('sale.createdAt <= :endDate', { endDate });
    }

    const results = await query.getRawMany();

    return results.map((item) => ({
      userId: item.userId,
      userName: item.userName,
      userEmail: item.userEmail,
      totalSales: parseInt(item.totalSales),
      totalRevenue: parseFloat(item.totalRevenue),
    }));
  }

  // Reporte: Ventas por método de pago
  async getSalesByPaymentMethod(
    startDate?: Date,
    endDate?: Date,
  ): Promise<SalesByPaymentMethod[]> {
    let query = this.saleRepository
      .createQueryBuilder('sale')
      .select('sale.paymentMethod', 'paymentMethod')
      .addSelect('COUNT(sale.id)', 'count')
      .addSelect('SUM(sale.total)', 'total')
      .groupBy('sale.paymentMethod')
      .orderBy('total', 'DESC');

    if (startDate) {
      query = query.where('sale.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query = query.andWhere('sale.createdAt <= :endDate', { endDate });
    }

    const results = await query.getRawMany();

    return results.map((item) => ({
      paymentMethod: item.paymentMethod,
      count: parseInt(item.count),
      total: parseFloat(item.total),
    }));
  }

  // Dashboard: Estadísticas generales
  async getDashboardStats(): Promise<DashboardStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total general
    const totalStats = await this.saleRepository
      .createQueryBuilder('sale')
      .select('COUNT(sale.id)', 'count')
      .addSelect('SUM(sale.total)', 'total')
      .getRawOne();

    // Stats del día
    const todayStats = await this.saleRepository
      .createQueryBuilder('sale')
      .select('COUNT(sale.id)', 'count')
      .addSelect('SUM(sale.total)', 'total')
      .where('sale.createdAt >= :today', { today })
      .getRawOne();

    // Top 5 productos más vendidos
    const topProducts = await this.getSalesByProduct();

    // Productos con stock bajo
    const lowStockCount = await this.productRepository
      .createQueryBuilder('product')
      .where('product.stock <= product.minStock')
      .andWhere('product.isActive = :isActive', { isActive: true })
      .getCount();

    // Ventas por método de pago
    const salesByPaymentMethod = await this.getSalesByPaymentMethod();

    const totalSales = parseInt(totalStats.count) || 0;
    const totalRevenue = parseFloat(totalStats.total) || 0;
    const todaySalesCount = parseInt(todayStats.count) || 0;

    return {
      totalRevenue,
      totalSales,
      todayRevenue: parseFloat(todayStats.total) || 0,
      todaySales: todaySalesCount,
      averageTicket: totalSales > 0 ? totalRevenue / totalSales : 0,
      topProducts: topProducts.slice(0, 5),
      lowStockProducts: lowStockCount,
      salesByPaymentMethod,
    };
  }

  // Reporte: Ventas por período (diario, semanal, mensual)
  async getSalesByPeriod(
    period: 'day' | 'week' | 'month',
    startDate: Date,
    endDate: Date,
  ): Promise<SalesByPeriod[]> {
    let dateFormat: string;

    switch (period) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-%u';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
    }

    const results = await this.saleRepository
      .createQueryBuilder('sale')
      .select(`DATE_FORMAT(sale.createdAt, '${dateFormat}')`, 'period')
      .addSelect('COUNT(sale.id)', 'totalSales')
      .addSelect('SUM(sale.total)', 'totalRevenue')
      .where('sale.createdAt >= :startDate', { startDate })
      .andWhere('sale.createdAt <= :endDate', { endDate })
      .groupBy('period')
      .orderBy('period', 'ASC')
      .getRawMany();

    return results.map((item) => ({
      period: item.period,
      totalSales: parseInt(item.totalSales),
      totalRevenue: parseFloat(item.totalRevenue),
    }));
  }

  // Reporte: Producto más vendido
  async getBestSellingProduct(): Promise<SalesByProduct | null> {
    const products = await this.getSalesByProduct();
    return products.length > 0 ? products[0] : null;
  }

  // Reporte: Producto con mayor ingresos
  async getHighestRevenueProduct(): Promise<SalesByProduct | null> {
    const results = await this.saleDetailRepository
      .createQueryBuilder('detail')
      .select('detail.productId', 'productId')
      .addSelect('detail.productName', 'productName')
      .addSelect('SUM(detail.quantity)', 'totalQuantity')
      .addSelect('SUM(detail.subtotal)', 'totalRevenue')
      .addSelect('COUNT(DISTINCT detail.saleId)', 'salesCount')
      .groupBy('detail.productId')
      .addGroupBy('detail.productName')
      .orderBy('totalRevenue', 'DESC')
      .limit(1)
      .getRawOne();

    if (!results) return null;

    return {
      productId: results.productId,
      productName: results.productName,
      totalQuantity: parseInt(results.totalQuantity),
      totalRevenue: parseFloat(results.totalRevenue),
      salesCount: parseInt(results.salesCount),
    };
  }
}