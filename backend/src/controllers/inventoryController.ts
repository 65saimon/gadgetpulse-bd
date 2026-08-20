import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getInventoryOverview = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { variants: true },
    });

    let totalUnits = 0;
    let totalPurchaseValue = 0;
    let totalSellingValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    for (const p of products) {
      if (p.variants.length > 0) {
        for (const v of p.variants) {
          totalUnits += v.stockQuantity;
          totalPurchaseValue += v.stockQuantity * v.purchasePrice;
          totalSellingValue += v.stockQuantity * (v.discountPrice || v.regularPrice);
          if (v.stockQuantity === 0) outOfStockCount++;
          else if (v.stockQuantity <= p.minStockLevel) lowStockCount++;
        }
      } else {
        totalUnits += p.stockQuantity;
        totalPurchaseValue += p.stockQuantity * p.purchasePrice;
        totalSellingValue += p.stockQuantity * (p.discountPrice || p.regularPrice);
        if (p.stockQuantity === 0) outOfStockCount++;
        else if (p.stockQuantity <= p.minStockLevel) lowStockCount++;
      }
    }

    return res.json({
      success: true,
      data: {
        totalProducts: products.length,
        totalUnits,
        totalPurchaseValue,
        totalSellingValue,
        estimatedProfitValue: totalSellingValue - totalPurchaseValue,
        lowStockCount,
        outOfStockCount,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getInventoryList = async (req: Request, res: Response) => {
  try {
    const { search, status, categoryId, brandId, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(1, parseInt(limit as string) || 20);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search) {
      const s = String(search).trim();
      where.OR = [
        { name: { contains: s } },
        { sku: { contains: s } },
      ];
    }
    if (categoryId && categoryId !== 'all') where.categoryId = String(categoryId);
    if (brandId && brandId !== 'all') where.brandId = String(brandId);

    if (status === 'OUT_OF_STOCK') where.stockQuantity = { lte: 0 };
    else if (status === 'LOW_STOCK') where.stockQuantity = { gt: 0, lte: 5 };
    else if (status === 'IN_STOCK') where.stockQuantity = { gt: 5 };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: { stockQuantity: 'asc' },
        skip,
        take: limitNum,
        include: {
          brand: true,
          category: true,
          variants: true,
        },
      }),
    ]);

    return res.json({
      success: true,
      data: products,
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

export const adjustStock = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, variantId, type, changeQuantity, reason, unitCost } = req.body;

    if (!productId || changeQuantity === undefined || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, quantity change, and reason are required.',
      });
    }

    const qtyChange = parseInt(changeQuantity);
    if (isNaN(qtyChange)) {
      return res.status(400).json({ success: false, message: 'Invalid quantity value.' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    let prevQty = product.stockQuantity;
    let newQty = Math.max(0, prevQty + qtyChange);

    if (variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
      if (!variant) return res.status(404).json({ success: false, message: 'Variant not found.' });
      prevQty = variant.stockQuantity;
      newQty = Math.max(0, prevQty + qtyChange);

      await prisma.productVariant.update({
        where: { id: variantId },
        data: { stockQuantity: newQty },
      });
    }

    // Update master product stock
    await prisma.product.update({
      where: { id: productId },
      data: {
        stockQuantity: { increment: qtyChange },
      },
    });

    // Record inventory transaction
    const transaction = await prisma.inventoryTransaction.create({
      data: {
        productId,
        variantId: variantId || null,
        type: type || 'MANUAL_ADJUSTMENT',
        prevQty,
        changeQty: qtyChange,
        newQty,
        unitCost: unitCost ? parseFloat(unitCost) : product.purchasePrice,
        reason,
        actor: req.user?.fullName || 'Admin',
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user?.id,
        userName: req.user?.fullName || 'Admin',
        action: 'STOCK_ADJUSTED',
        entity: 'Inventory',
        entityId: productId,
        details: `Adjusted stock for ${product.name}: ${qtyChange > 0 ? '+' : ''}${qtyChange} units. Reason: ${reason}`,
      },
    });

    return res.json({
      success: true,
      message: 'Stock adjusted successfully.',
      transaction,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getStockMovementHistory = async (req: Request, res: Response) => {
  try {
    const { productId, type, page = '1', limit = '25' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(1, parseInt(limit as string) || 25);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (productId) where.productId = String(productId);
    if (type && type !== 'all') where.type = String(type);

    const [total, transactions] = await Promise.all([
      prisma.inventoryTransaction.count({ where }),
      prisma.inventoryTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          product: { select: { name: true, sku: true, mainImage: true } },
          variant: { select: { name: true, sku: true } },
          order: { select: { orderNumber: true } },
        },
      }),
    ]);

    return res.json({
      success: true,
      data: transactions,
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
