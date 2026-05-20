import prisma from '../config/prisma.js';
import { mapProduct } from '../utils/mapper.js';

const getLowStockThreshold = () => {
  const value = process.env.LOW_STOCK_THRESHOLD;
  return value ? Number(value) : 5;
};

export const getDashboardStats = async () => {
  const threshold = getLowStockThreshold();

  const [
    totalOrders,
    pendingOrders,
    completedOrders,
    totalProducts,
    totalCustomers,
    lowStockProducts,
    salesAggregate,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'COMPLETED' } }),
    prisma.product.count(),
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.product.findMany({
      where: { stock: { lte: threshold } },
      include: {
        images: {
          orderBy: { isPrimary: 'desc' },
          take: 1,
        },
      },
      orderBy: { stock: 'asc' },
    }),
    prisma.order.aggregate({
      where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'] } },
      _sum: { total: true },
    }),
  ]);

  return {
    totalSales: salesAggregate._sum.total ?? 0,
    totalOrders,
    pendingOrders,
    completedOrders,
    lowStockProducts: lowStockProducts.map(mapProduct),
    totalProducts,
    totalCustomers,
  };
};
