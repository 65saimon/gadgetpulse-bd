import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

// ---------------- SUPPLIERS ----------------
export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { purchases: true } },
      },
    });
    return res.json({ success: true, data: suppliers });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createSupplier = async (req: AuthRequest, res: Response) => {
  try {
    const { name, company, phone, email, address } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Supplier name and phone are required.' });
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        company: company || name,
        phone,
        email,
        address,
      },
    });

    return res.status(201).json({ success: true, message: 'Supplier added.', supplier });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSupplier = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, company, phone, email, address, isActive } = req.body;

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(company && { company }),
        ...(phone && { phone }),
        ...(email !== undefined && { email }),
        ...(address !== undefined && { address }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return res.json({ success: true, message: 'Supplier updated.', supplier });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- PURCHASES / RESTOCK ----------------
export const getPurchases = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(1, parseInt(limit as string) || 20);
    const skip = (pageNum - 1) * limitNum;

    const [total, purchases] = await Promise.all([
      prisma.purchase.count(),
      prisma.purchase.findMany({
        orderBy: { purchaseDate: 'desc' },
        skip,
        take: limitNum,
        include: {
          supplier: true,
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      }),
    ]);

    return res.json({
      success: true,
      data: purchases,
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

export const createPurchase = async (req: AuthRequest, res: Response) => {
  try {
    const { supplierId, referenceNo, items, notes } = req.body;

    if (!supplierId || !items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Supplier and at least one item with unit cost and quantity are required.',
      });
    }

    const now = new Date();
    const purchaseNumber = `PO-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let totalAmount = 0;
    for (const item of items) {
      const lineCost = (parseFloat(item.unitCost) || 0) * (parseInt(item.quantity) || 1);
      totalAmount += lineCost;
    }

    const result = await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.create({
        data: {
          purchaseNumber,
          supplierId,
          referenceNo,
          purchaseDate: now,
          totalAmount,
          notes,
          status: 'RECEIVED',
        },
      });

      for (const item of items) {
        const qty = parseInt(item.quantity) || 1;
        const unitCost = parseFloat(item.unitCost) || 0;
        const totalCost = qty * unitCost;

        await tx.purchaseItem.create({
          data: {
            purchaseId: purchase.id,
            productId: item.productId,
            variantId: item.variantId || null,
            quantity: qty,
            unitCost,
            totalCost,
          },
        });

        // Restock variant
        if (item.variantId) {
          const v = await tx.productVariant.findUnique({ where: { id: item.variantId } });
          if (v) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stockQuantity: { increment: qty },
                purchasePrice: unitCost, // Update latest purchase cost
              },
            });

            await tx.inventoryTransaction.create({
              data: {
                productId: item.productId,
                variantId: item.variantId,
                type: 'STOCK_IN_PURCHASE',
                prevQty: v.stockQuantity,
                changeQty: qty,
                newQty: v.stockQuantity + qty,
                unitCost,
                reason: `Supplier PO #${purchase.purchaseNumber}`,
                actor: req.user?.fullName || 'Admin',
              },
            });
          }
        }

        // Restock master product
        const p = await tx.product.findUnique({ where: { id: item.productId } });
        if (p) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: { increment: qty },
              purchasePrice: unitCost,
            },
          });
        }
      }

      await tx.activityLog.create({
        data: {
          userId: req.user?.id,
          userName: req.user?.fullName || 'Admin',
          action: 'PURCHASE_RECEIVED',
          entity: 'Purchase',
          entityId: purchase.id,
          details: `Recorded purchase order ${purchase.purchaseNumber} for ৳${totalAmount.toLocaleString()} and restocked inventory.`,
        },
      });

      return purchase;
    });

    return res.status(201).json({
      success: true,
      message: 'Purchase recorded and inventory restocked successfully.',
      purchase: result,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
