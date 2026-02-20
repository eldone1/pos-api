import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale, PaymentMethod } from './entities/sale.entity';
import { SaleDetail } from './entities/sale-detail.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(SaleDetail)
    private readonly saleDetailRepository: Repository<SaleDetail>,
    private readonly productsService: ProductsService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createSaleDto: CreateSaleDto, userId: string): Promise<Sale> {
    // Usar transacción para garantizar consistencia
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let subtotal = 0;
      const saleDetails: SaleDetail[] = [];

      // Validar productos y stock
      for (const detail of createSaleDto.details) {
        const product = await this.productsService.findOne(detail.productId);

        if (!product.isActive) {
          throw new BadRequestException(
            `El producto ${product.name} no está disponible`,
          );
        }

        if (product.stock < detail.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para ${product.name}. Disponible: ${product.stock}`,
          );
        }

        // Calcular subtotal del detalle
        const itemSubtotal = product.price * detail.quantity;
        subtotal += itemSubtotal;

        // Crear detalle de venta
        const saleDetail = this.saleDetailRepository.create({
          productId: product.id,
          productName: product.name,
          quantity: detail.quantity,
          unitPrice: product.price,
          subtotal: itemSubtotal,
        });

        saleDetails.push(saleDetail);

        // Descontar stock
        product.stock -= detail.quantity;
        await queryRunner.manager.save(product);
      }

      // Calcular totales
      const discount = createSaleDto.discount || 0;
      const tax = (subtotal - discount) * 0.18; // 18% IGV
      const total = subtotal - discount + tax;

      // Generar número de factura único
      const invoiceNumber = await this.generateInvoiceNumber();

      // Crear venta
      const sale = this.saleRepository.create({
        invoiceNumber,
        subtotal,
        tax,
        discount,
        total,
        paymentMethod: createSaleDto.paymentMethod || PaymentMethod.CASH,
        userId,
        details: saleDetails,
      });

      // Guardar venta con sus detalles
      const savedSale = await queryRunner.manager.save(sale);

      // Confirmar transacción
      await queryRunner.commitTransaction();

      // Retornar venta con relaciones
      return await this.findOne(savedSale.id);
    } catch (error) {
      // Revertir transacción en caso de error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Liberar queryRunner
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Sale[]> {
    return await this.saleRepository.find({
      relations: ['user', 'details', 'details.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Sale> {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: ['user', 'details', 'details.product'],
    });

    if (!sale) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    return sale;
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<Sale> {
    const sale = await this.saleRepository.findOne({
      where: { invoiceNumber },
      relations: ['user', 'details', 'details.product'],
    });

    if (!sale) {
      throw new NotFoundException(
        `Venta con número de factura ${invoiceNumber} no encontrada`,
      );
    }

    return sale;
  }

  async findByUser(userId: string): Promise<Sale[]> {
    return await this.saleRepository.find({
      where: { userId },
      relations: ['details', 'details.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Sale[]> {
    return await this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.user', 'user')
      .leftJoinAndSelect('sale.details', 'details')
      .leftJoinAndSelect('details.product', 'product')
      .where('sale.createdAt >= :startDate', { startDate })
      .andWhere('sale.createdAt <= :endDate', { endDate })
      .orderBy('sale.createdAt', 'DESC')
      .getMany();
  }

  async getTotalSales(): Promise<number> {
    const result = await this.saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.total)', 'total')
      .getRawOne();

    return parseFloat(result.total) || 0;
  }

  async getTodaySales(): Promise<{ count: number; total: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.saleRepository
      .createQueryBuilder('sale')
      .select('COUNT(sale.id)', 'count')
      .addSelect('SUM(sale.total)', 'total')
      .where('sale.createdAt >= :today', { today })
      .getRawOne();

    return {
      count: parseInt(result.count) || 0,
      total: parseFloat(result.total) || 0,
    };
  }

  private async generateInvoiceNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    // Contar ventas del día
    const count = await this.saleRepository
      .createQueryBuilder('sale')
      .where('DATE(sale.createdAt) = CURDATE()')
      .getCount();

    const sequential = String(count + 1).padStart(4, '0');

    return `F${year}${month}${day}-${sequential}`;
  }
}