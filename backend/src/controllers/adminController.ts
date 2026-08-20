import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    
    // Start of Today
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Start of Week (Last 7 days)
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    
    // Start of Month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      allOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
    ] = await Promise.all([
      prisma.order.findMany({ include: { items: true } }),
      prisma.order.findMany({ where: { createdAt: { gte: startOfToday } } }),
      prisma.order.findMany({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.order.findMany({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.customer.count(),
      prisma.product.count(),
      prisma.product.count({ where: { stockQuantity: { gt: 0, lte: 5 } } }),
      prisma.product.count({ where: { stockQuantity: { lte: 0 } } }),
    ]);

    const totalSales = allOrders
      .filter((o) => o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + o.grandTotal, 0);

    const todaySales = todayOrders
      .filter((o) => o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + o.grandTotal, 0);

    const weekSales = weekOrders
      .filter((o) => o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + o.grandTotal, 0);

    const monthSales = monthOrders
      .filter((o) => o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + o.grandTotal, 0);

    const pendingOrdersCount = allOrders.filter((o) => ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED'].includes(o.orderStatus)).length;
    const completedOrdersCount = allOrders.filter((o) => o.orderStatus === 'DELIVERED').length;
    const cancelledOrdersCount = allOrders.filter((o) => ['CANCELLED', 'RETURNED'].includes(o.orderStatus)).length;

    // Calculate Total Estimated Profit
    let totalRevenue = 0;
    let totalCost = 0;
    allOrders.forEach((o) => {
      totalRevenue += (o.subtotal - o.discountAmount);
      o.items.forEach((item) => {
        totalCost += (item.purchaseCost * item.quantity);
      });
    });

    return res.json({
      success: true,
      stats: {
        totalSales,
        todaySales,
        weekSales,
        monthSales,
        totalOrders: allOrders.length,
        pendingOrders: pendingOrdersCount,
        completedOrders: completedOrdersCount,
        cancelledOrders: cancelledOrdersCount,
        totalCustomers,
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalProfit: Math.max(0, totalRevenue - totalCost),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDashboardCharts = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        items: {
          include: { product: { include: { category: true, brand: true } } },
        },
      },
    });

    // 1. Sales by Day (Last 14 days)
    const dayMap: { [key: string]: { date: string; sales: number; orders: number } } = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 3600 * 1000);
      const key = d.toISOString().slice(5, 10); // MM-DD
      dayMap[key] = { date: key, sales: 0, orders: 0 };
    }

    orders.forEach((o) => {
      const key = o.createdAt.toISOString().slice(5, 10);
      if (dayMap[key]) {
        dayMap[key].sales += o.grandTotal;
        dayMap[key].orders += 1;
      }
    });

    // 2. Orders by Status Breakdown
    const statusMap: { [status: string]: number } = {
      DELIVERED: 0,
      SHIPPED: 0,
      PROCESSING: 0,
      PENDING: 0,
      CANCELLED: 0,
      RETURNED: 0,
    };
    orders.forEach((o) => {
      if (statusMap[o.orderStatus] !== undefined) {
        statusMap[o.orderStatus]++;
      } else {
        statusMap[o.orderStatus] = 1;
      }
    });

    const orderStatusChart = Object.entries(statusMap).map(([name, value]) => ({
      name,
      value,
    }));

    // 3. Revenue by Category
    const categoryMap: { [cat: string]: number } = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        const catName = item.product?.category?.name || 'Gadgets';
        categoryMap[catName] = (categoryMap[catName] || 0) + item.totalPrice;
      });
    });

    const categoryRevenueChart = Object.entries(categoryMap).map(([name, revenue]) => ({
      name,
      revenue,
    })).sort((a, b) => b.revenue - a.revenue);

    // 4. Top 5 Best Selling Products
    const productSoldMap: { [name: string]: { name: string; units: number; revenue: number } } = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        const name = item.productName || item.product?.name || 'Item';
        if (!productSoldMap[name]) {
          productSoldMap[name] = { name, units: 0, revenue: 0 };
        }
        productSoldMap[name].units += item.quantity;
        productSoldMap[name].revenue += item.totalPrice;
      });
    });

    const topSellingProducts = Object.values(productSoldMap)
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);

    return res.json({
      success: true,
      charts: {
        dailySales: Object.values(dayMap),
        orderStatus: orderStatusChart,
        categoryRevenue: categoryRevenueChart,
        topSellingProducts,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getActivityLogs = async (req: Request, res: Response) => {
  try {
    const { search, entity, page = '1', limit = '25' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(1, parseInt(limit as string) || 25);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search) {
      const s = String(search).trim();
      where.OR = [
        { userName: { contains: s } },
        { action: { contains: s } },
        { details: { contains: s } },
      ];
    }
    if (entity && entity !== 'all') where.entity = String(entity);

    const [total, logs] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    return res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
