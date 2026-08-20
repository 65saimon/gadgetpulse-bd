import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const { search, startDate, endDate, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(1, parseInt(limit as string) || 20);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      const s = String(search).trim();
      where.OR = [
        { invoiceNumber: { contains: s } },
        { customerName: { contains: s } },
        { customerPhone: { contains: s } },
        { order: { orderNumber: { contains: s } } },
      ];
    }

    if (startDate || endDate) {
      where.issueDate = {};
      if (startDate) where.issueDate.gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.issueDate.lte = end;
      }
    }

    const [total, invoices] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        orderBy: { issueDate: 'desc' },
        skip,
        take: limitNum,
        include: {
          order: {
            include: {
              items: true,
            },
          },
        },
      }),
    ]);

    return res.json({
      success: true,
      data: invoices,
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

export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.findFirst({
      where: {
        OR: [{ id }, { invoiceNumber: id }, { orderId: id }],
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: { select: { name: true, warranty: true, brand: true } },
                variant: true,
              },
            },
          },
        },
        customer: { select: { id: true, fullName: true, email: true, phone: true } },
      },
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    // Get store settings for invoice header
    const storeSettings = await prisma.storeSetting.findMany();
    const settingsMap: { [key: string]: string } = {};
    storeSettings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return res.json({
      success: true,
      invoice,
      store: {
        name: settingsMap.STORE_NAME || 'GadgetPulse Bangladesh',
        tagline: settingsMap.STORE_TAGLINE || 'Premier Gadgets & Mobile Hub',
        address: settingsMap.STORE_ADDRESS || 'Jamuna Future Park, Kuril, Dhaka',
        phone: settingsMap.STORE_PHONE || '+880 1819-285538',
        email: settingsMap.STORE_EMAIL || 'support@gadgetpulse.bd',
        terms: settingsMap.INVOICE_TERMS || invoice.terms,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
