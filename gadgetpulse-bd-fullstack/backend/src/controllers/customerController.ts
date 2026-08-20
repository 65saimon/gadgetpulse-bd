import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const { search, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(1, parseInt(limit as string) || 20);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search) {
      const s = String(search).trim();
      where.OR = [
        { fullName: { contains: s } },
        { email: { contains: s } },
        { phone: { contains: s } },
      ];
    }

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          _count: { select: { orders: true } },
          orders: {
            select: {
              grandTotal: true,
              paymentStatus: true,
              orderStatus: true,
              createdAt: true,
            },
          },
        },
      }),
    ]);

    const formatted = customers.map((c) => {
      const totalSpent = c.orders
        .filter((o) => o.paymentStatus === 'PAID')
        .reduce((sum, o) => sum + o.grandTotal, 0);

      const lastOrder = c.orders.length > 0
        ? c.orders.reduce((latest, o) => (new Date(o.createdAt) > new Date(latest.createdAt) ? o : latest))
        : null;

      const { passwordHash, ...safeCustomer } = c;
      return {
        ...safeCustomer,
        orderCount: c._count.orders,
        totalSpent,
        lastPurchaseDate: lastOrder ? lastOrder.createdAt : null,
        latestStatus: lastOrder ? lastOrder.orderStatus : 'NONE',
      };
    });

    return res.json({
      success: true,
      data: formatted,
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

export const getCustomerDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: true,
            invoice: true,
          },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const totalOrders = customer.orders.length;
    const paidOrders = customer.orders.filter((o) => o.paymentStatus === 'PAID');
    const totalSpent = paidOrders.reduce((sum, o) => sum + o.grandTotal, 0);
    const avgOrderValue = paidOrders.length > 0 ? Math.round(totalSpent / paidOrders.length) : 0;

    const { passwordHash, ...safeCustomer } = customer;

    return res.json({
      success: true,
      customer: {
        ...safeCustomer,
        stats: {
          totalOrders,
          totalSpent,
          avgOrderValue,
          lastOrderDate: customer.orders[0]?.createdAt || null,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
