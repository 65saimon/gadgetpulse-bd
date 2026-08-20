import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      division,
      district,
      upazila,
      shippingAddress,
      paymentMethod,
      transactionId,
      senderPhone,
      items, // array of { productId, variantId, quantity }
      couponCode,
    } = req.body;

    if (!customerName || !customerPhone || !division || !district || !shippingAddress || !items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full customer name, phone, address, and at least one item.',
      });
    }

    // 1. Fetch products & variants, validate stock
    const itemSnapshots: any[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });

      if (!product || !product.isPublished) {
        return res.status(400).json({ success: false, message: `Product not found or unavailable.` });
      }

      let variant = null;
      let unitPrice = product.discountPrice || product.regularPrice;
      let purchaseCost = product.purchasePrice;
      let sku = product.sku;
      let variantName = 'Standard';
      let availableStock = product.stockQuantity;

      if (item.variantId) {
        variant = product.variants.find((v) => v.id === item.variantId);
        if (variant) {
          unitPrice = variant.discountPrice || variant.regularPrice;
          purchaseCost = variant.purchasePrice;
          sku = variant.sku;
          variantName = variant.name;
          availableStock = variant.stockQuantity;
        }
      }

      const orderQty = Math.max(1, parseInt(item.quantity) || 1);
      if (availableStock < orderQty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name} (${variantName})". Available: ${availableStock}, Requested: ${orderQty}`,
        });
      }

      const lineTotal = unitPrice * orderQty;
      subtotal += lineTotal;

      itemSnapshots.push({
        productId: product.id,
        variantId: variant ? variant.id : null,
        productName: product.name,
        variantName,
        sku,
        unitPrice,
        purchaseCost,
        quantity: orderQty,
        totalPrice: lineTotal,
      });
    }

    // 2. Financial calculation
    let discountAmount = 0;
    if (couponCode && couponCode.toUpperCase() === 'GADGET10') {
      discountAmount = Math.round(subtotal * 0.10);
    }

    const deliveryFee = subtotal >= 50000 ? 0 : (division.toLowerCase() === 'dhaka' ? 60 : 120);
    const vatAmount = Math.round((subtotal - discountAmount) * 0.05); // 5% standard VAT
    const grandTotal = subtotal - discountAmount + deliveryFee + vatAmount;

    // 3. Generate sequential numbers
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${dateStr}-${randomSeq}`;
    const invoiceNumber = `INV-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const paymentStatus = ['BKASH', 'NAGAD', 'BANK_TRANSFER'].includes(paymentMethod) && transactionId
      ? 'PAID'
      : 'PENDING';

    // 4. Atomic Prisma Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: req.user?.type === 'CUSTOMER' ? req.user.id : null,
          customerName,
          customerPhone,
          customerEmail,
          division,
          district,
          upazila: upazila || '',
          shippingAddress,
          subtotal,
          discountAmount,
          couponCode: couponCode || null,
          deliveryFee,
          vatAmount,
          grandTotal,
          paymentMethod: paymentMethod || 'CASH_ON_DELIVERY',
          paymentStatus,
          transactionId: transactionId || null,
          senderPhone: senderPhone || null,
          paidAt: paymentStatus === 'PAID' ? now : null,
          orderStatus: 'PENDING',
        },
      });

      // Create Order Items & Deduct Inventory Stock
      for (const item of itemSnapshots) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            variantName: item.variantName,
            sku: item.sku,
            unitPrice: item.unitPrice,
            purchaseCost: item.purchaseCost,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
          },
        });

        // Deduct variant stock if variant exists
        if (item.variantId) {
          const varRecord = await tx.productVariant.findUnique({ where: { id: item.variantId } });
          if (varRecord) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stockQuantity: { decrement: item.quantity } },
            });

            await tx.inventoryTransaction.create({
              data: {
                productId: item.productId,
                variantId: item.variantId,
                orderId: order.id,
                type: 'ORDER_SOLD',
                prevQty: varRecord.stockQuantity,
                changeQty: -item.quantity,
                newQty: varRecord.stockQuantity - item.quantity,
                unitCost: item.purchaseCost,
                reason: `Sold in Order #${order.orderNumber}`,
                actor: customerName,
              },
            });
          }
        }

        // Deduct main product stock
        const prodRecord = await tx.product.findUnique({ where: { id: item.productId } });
        if (prodRecord) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { decrement: item.quantity } },
          });

          if (!item.variantId) {
            await tx.inventoryTransaction.create({
              data: {
                productId: item.productId,
                orderId: order.id,
                type: 'ORDER_SOLD',
                prevQty: prodRecord.stockQuantity,
                changeQty: -item.quantity,
                newQty: prodRecord.stockQuantity - item.quantity,
                unitCost: item.purchaseCost,
                reason: `Sold in Order #${order.orderNumber}`,
                actor: customerName,
              },
            });
          }
        }
      }

      // Create Invoice
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          orderId: order.id,
          customerId: req.user?.type === 'CUSTOMER' ? req.user.id : null,
          issueDate: now,
          customerName,
          customerPhone,
          customerAddress: `${shippingAddress}, ${upazila ? upazila + ', ' : ''}${district}, ${division}`,
          subtotal,
          discount: discountAmount,
          deliveryFee,
          vat: vatAmount,
          grandTotal,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
        },
      });

      return { order, invoice };
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully! Thank you for shopping with GadgetPulse BD.',
      order: result.order,
      invoice: result.invoice,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to place order.' });
  }
};

export const getCustomerOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true } },
        invoice: true,
      },
    });

    return res.json({ success: true, data: orders });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminOrders = async (req: Request, res: Response) => {
  try {
    const { status, paymentStatus, paymentMethod, search, startDate, endDate, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(1, parseInt(limit as string) || 20);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status && status !== 'all') {
      where.orderStatus = String(status);
    }

    if (paymentStatus && paymentStatus !== 'all') {
      where.paymentStatus = String(paymentStatus);
    }

    if (paymentMethod && paymentMethod !== 'all') {
      where.paymentMethod = String(paymentMethod);
    }

    if (search) {
      const searchTerm = String(search).trim();
      where.OR = [
        { orderNumber: { contains: searchTerm } },
        { customerName: { contains: searchTerm } },
        { customerPhone: { contains: searchTerm } },
        { transactionId: { contains: searchTerm } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          items: true,
          invoice: true,
        },
      }),
    ]);

    return res.json({
      success: true,
      data: orders,
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

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: {
          include: {
            product: { include: { brand: true, category: true } },
            variant: true,
          },
        },
        invoice: true,
        customer: { select: { id: true, fullName: true, email: true, phone: true } },
        stockHistory: true,
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.json({ success: true, order });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const trackOrderPublic = async (req: Request, res: Response) => {
  try {
    const { orderNumber, phone } = req.query;
    if (!orderNumber || !phone) {
      return res.status(400).json({ success: false, message: 'Order number and phone number are required.' });
    }

    const order = await prisma.order.findFirst({
      where: {
        orderNumber: String(orderNumber).trim(),
        customerPhone: { contains: String(phone).trim().replace(/^\+88/, '') },
      },
      include: {
        items: true,
        invoice: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No matching order found. Please verify your Order ID and phone number.',
      });
    }

    return res.json({ success: true, order });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { orderStatus, adminNotes, paymentStatus } = req.body;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingOrder) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const oldStatus = existingOrder.orderStatus;
    const isNowCancelledOrReturned = ['CANCELLED', 'RETURNED'].includes(orderStatus);
    const wasAlreadyCancelledOrReturned = ['CANCELLED', 'RETURNED'].includes(oldStatus);

    await prisma.$transaction(async (tx) => {
      // If order was active and is now cancelled/returned, restore inventory
      if (isNowCancelledOrReturned && !wasAlreadyCancelledOrReturned) {
        for (const item of existingOrder.items) {
          if (item.variantId) {
            const v = await tx.productVariant.findUnique({ where: { id: item.variantId } });
            if (v) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stockQuantity: { increment: item.quantity } },
              });

              await tx.inventoryTransaction.create({
                data: {
                  productId: item.productId,
                  variantId: item.variantId,
                  orderId: id,
                  type: orderStatus === 'CANCELLED' ? 'ORDER_CANCELLED_RESTORE' : 'RETURN_RESTORE',
                  prevQty: v.stockQuantity,
                  changeQty: item.quantity,
                  newQty: v.stockQuantity + item.quantity,
                  unitCost: item.purchaseCost,
                  reason: `Stock restored due to order ${orderStatus.toLowerCase()}`,
                  actor: req.user?.fullName || 'Admin',
                },
              });
            }
          }

          const p = await tx.product.findUnique({ where: { id: item.productId } });
          if (p) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stockQuantity: { increment: item.quantity } },
            });
          }
        }
      }

      // Update order
      await tx.order.update({
        where: { id },
        data: {
          ...(orderStatus && { orderStatus }),
          ...(adminNotes !== undefined && { adminNotes }),
          ...(paymentStatus && { paymentStatus }),
        },
      });

      // Update corresponding invoice payment status if needed
      if (paymentStatus) {
        await tx.invoice.updateMany({
          where: { orderId: id },
          data: { paymentStatus },
        });
      }

      // Log Activity
      await tx.activityLog.create({
        data: {
          userId: req.user?.id,
          userName: req.user?.fullName || 'Admin',
          action: 'ORDER_STATUS_UPDATED',
          entity: 'Order',
          entityId: id,
          details: `Order #${existingOrder.orderNumber} status changed from ${oldStatus} to ${orderStatus}.`,
        },
      });
    });

    return res.json({ success: true, message: `Order status updated to ${orderStatus}.` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
