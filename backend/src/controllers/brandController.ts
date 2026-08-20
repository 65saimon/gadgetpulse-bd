import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getBrands = async (req: Request, res: Response) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });
    return res.json({ success: true, data: brands });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createBrand = async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, logoUrl, description, website, isFeatured } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Brand name is required.' });

    const autoSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const brand = await prisma.brand.create({
      data: {
        name,
        slug: autoSlug,
        logoUrl,
        description,
        website,
        isFeatured: isFeatured ?? false,
      },
    });

    return res.status(201).json({ success: true, message: 'Brand created.', brand });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBrand = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, logoUrl, description, website, isFeatured } = req.body;

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(description !== undefined && { description }),
        ...(website !== undefined && { website }),
        ...(isFeatured !== undefined && { isFeatured }),
      },
    });

    return res.json({ success: true, message: 'Brand updated.', brand });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBrand = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.brand.delete({ where: { id } });
    return res.json({ success: true, message: 'Brand deleted.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
