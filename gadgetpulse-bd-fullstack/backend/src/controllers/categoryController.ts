import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });

    return res.json({ success: true, data: categories });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllCategoriesAdmin = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });
    return res.json({ success: true, data: categories });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, description, imageUrl, iconName, displayOrder, isActive } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required.' });

    const autoSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const category = await prisma.category.create({
      data: {
        name,
        slug: autoSlug,
        description,
        imageUrl,
        iconName: iconName || 'Folder',
        displayOrder: parseInt(displayOrder) || 0,
        isActive: isActive ?? true,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user?.id,
        userName: req.user?.fullName || 'Admin',
        action: 'CATEGORY_CREATED',
        entity: 'Category',
        entityId: category.id,
        details: `Created category "${category.name}".`,
      },
    });

    return res.status(201).json({ success: true, message: 'Category created.', category });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, imageUrl, iconName, displayOrder, isActive } = req.body;

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(iconName !== undefined && { iconName }),
        ...(displayOrder !== undefined && { displayOrder: parseInt(displayOrder) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return res.json({ success: true, message: 'Category updated.', category: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    return res.json({ success: true, message: 'Category deleted.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
