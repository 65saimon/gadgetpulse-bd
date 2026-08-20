import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getSalesReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: { items: true },
    });

    let totalGrossSales = 0;
    let totalDiscounts = 0;
    let totalVAT = 0;
    let totalDelivery = 0;
    let totalNetSales = 0;
    let totalProductCost = 0;

    // Group by Date (YYYY-MM-DD)
    const dailyMap: { [date: string]: any } = {};

    orders.forEach((o) => {
      const dateKey = o.createdAt.toISOString().slice(0, 10);
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = {
          date: dateKey,
          orderCount: 0,
          grossSales: 0,
          discounts: 0,
          vat: 0,
          deliveryFees: 0,
          netSales: 0,
          cost: 0,
          profit: 0,
        };
      }

      const orderCost = o.items.reduce((sum, item) => sum + item.purchaseCost * item.quantity, 0);

      dailyMap[dateKey].orderCount += 1;
      dailyMap[dateKey].grossSales += o.subtotal;
      dailyMap[dateKey].discounts += o.discountAmount;
      dailyMap[dateKey].vat += o.vatAmount;
      dailyMap[dateKey].deliveryFees += o.deliveryFee;
      dailyMap[dateKey].netSales += o.grandTotal;
      dailyMap[dateKey].cost += orderCost;
      dailyMap[dateKey].profit += (o.subtotal - o.discountAmount - orderCost);

      totalGrossSales += o.subtotal;
      totalDiscounts += o.discountAmount;
      totalVAT += o.vatAmount;
      totalDelivery += o.deliveryFee;
      totalNetSales += o.grandTotal;
      totalProductCost += orderCost;
    });

    const dailyBreakdown = Object.values(dailyMap);

    return res.json({
      success: true,
      summary: {
        totalOrders: orders.length,
        totalGrossSales,
        totalDiscounts,
        totalVAT,
        totalDelivery,
        totalNetSales,
        totalProductCost,
        netProfit: totalGrossSales - totalDiscounts - totalProductCost,
      },
      dailyBreakdown,
      data: {
        totalRevenue: totalNetSales,
        totalProfit: totalGrossSales - totalDiscounts - totalProductCost,
        orderCount: orders.length,
        dailyBreakdown,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductSalesReport = async (req: Request, res: Response) => {
  try {
    const orderItems = await prisma.orderItem.findMany({
      include: {
        product: { select: { name: true, sku: true, category: { select: { name: true } }, brand: { select: { name: true } } } },
      },
    });

    const productMap: { [key: string]: any } = {};

    orderItems.forEach((item) => {
      const key = item.productId;
      if (!productMap[key]) {
        productMap[key] = {
          productId: item.productId,
          productName: item.productName || item.product.name,
          sku: item.sku || item.product.sku,
          category: item.product.category?.name || 'Gadgets',
          brand: item.product.brand?.name || 'Generic',
          unitsSold: 0,
          totalRevenue: 0,
          totalCost: 0,
          profit: 0,
          marginPercent: 0,
        };
      }

      productMap[key].unitsSold += item.quantity;
      productMap[key].totalRevenue += item.totalPrice;
      const cost = item.purchaseCost * item.quantity;
      productMap[key].totalCost += cost;
      productMap[key].profit += (item.totalPrice - cost);
    });

    const list = Object.values(productMap).map((p) => ({
      ...p,
      marginPercent: p.totalRevenue > 0 ? parseFloat(((p.profit / p.totalRevenue) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);

    return res.json({ success: true, data: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getInventoryReport = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        brand: true,
        variants: true,
      },
      orderBy: { name: 'asc' },
    });

    const reportRows: any[] = [];
    let grandStockUnits = 0;
    let grandCostValue = 0;
    let grandSalesValue = 0;

    for (const p of products) {
      if (p.variants.length > 0) {
        for (const v of p.variants) {
          const costVal = v.stockQuantity * v.purchasePrice;
          const salesVal = v.stockQuantity * (v.discountPrice || v.regularPrice);
          grandStockUnits += v.stockQuantity;
          grandCostValue += costVal;
          grandSalesValue += salesVal;

          reportRows.push({
            productId: p.id,
            name: `${p.name} - ${v.name}`,
            sku: v.sku,
            brand: p.brand.name,
            category: p.category.name,
            stock: v.stockQuantity,
            unitCost: v.purchasePrice,
            unitPrice: v.discountPrice || v.regularPrice,
            totalCostValue: costVal,
            totalSalesValue: salesVal,
            status: v.stockQuantity === 0 ? 'OUT_OF_STOCK' : (v.stockQuantity <= p.minStockLevel ? 'LOW_STOCK' : 'IN_STOCK'),
          });
        }
      } else {
        const costVal = p.stockQuantity * p.purchasePrice;
        const salesVal = p.stockQuantity * (p.discountPrice || p.regularPrice);
        grandStockUnits += p.stockQuantity;
        grandCostValue += costVal;
        grandSalesValue += salesVal;

        reportRows.push({
          productId: p.id,
          name: p.name,
          sku: p.sku,
          brand: p.brand.name,
          category: p.category.name,
          stock: p.stockQuantity,
          unitCost: p.purchasePrice,
          unitPrice: p.discountPrice || p.regularPrice,
          totalCostValue: costVal,
          totalSalesValue: salesVal,
          status: p.stockQuantity === 0 ? 'OUT_OF_STOCK' : (p.stockQuantity <= p.minStockLevel ? 'LOW_STOCK' : 'IN_STOCK'),
        });
      }
    }

    return res.json({
      success: true,
      summary: {
        totalSkus: reportRows.length,
        totalStockUnits: grandStockUnits,
        totalCostValue: grandCostValue,
        totalSalesValue: grandSalesValue,
        projectedMargin: grandSalesValue - grandCostValue,
      },
      data: reportRows,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
