import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      minRating,
      isFeatured,
      isBestSeller,
      isNewArrival,
      sortBy = 'newest',
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string) || 12));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      isPublished: true,
    };

    // Text search in name, shortDesc, description, or SKU
    if (search) {
      const searchTerm = String(search).trim();
      where.OR = [
        { name: { contains: searchTerm } },
        { shortDesc: { contains: searchTerm } },
        { sku: { contains: searchTerm } },
        { brand: { name: { contains: searchTerm } } },
        { category: { name: { contains: searchTerm } } },
      ];
    }

    // Category filter by slug or ID
    if (category && category !== 'all') {
      where.category = {
        OR: [{ slug: String(category) }, { id: String(category) }],
      };
    }

    // Brand filter by slug or ID
    if (brand && brand !== 'all') {
      where.brand = {
        OR: [{ slug: String(brand) }, { id: String(brand) }],
      };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.regularPrice = {};
      if (minPrice) where.regularPrice.gte = parseFloat(minPrice as string);
      if (maxPrice) where.regularPrice.lte = parseFloat(maxPrice as string);
    }

    // Stock availability
    if (inStock === 'true') {
      where.stockQuantity = { gt: 0 };
    } else if (inStock === 'false') {
      where.stockQuantity = { lte: 0 };
    }

    // Rating filter
    if (minRating) {
      where.rating = { gte: parseFloat(minRating as string) };
    }

    // Flags
    if (isFeatured === 'true') where.isFeatured = true;
    if (isBestSeller === 'true') where.isBestSeller = true;
    if (isNewArrival === 'true') where.isNewArrival = true;

    // Sorting
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price_asc') orderBy = { regularPrice: 'asc' };
    else if (sortBy === 'price_desc') orderBy = { regularPrice: 'desc' };
    else if (sortBy === 'popularity') orderBy = { ratingCount: 'desc' };
    else if (sortBy === 'rating') orderBy = { rating: 'desc' };
    else if (sortBy === 'discount') orderBy = { discountPrice: 'asc' };
    else if (sortBy === 'name_asc') orderBy = { name: 'asc' };

    const [totalProducts, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          brand: true,
          category: true,
          variants: true,
          images: { orderBy: { sortOrder: 'asc' } },
        },
      }),
    ]);

    return res.json({
      success: true,
      data: products,
      pagination: {
        total: totalProducts,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalProducts / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      include: {
        brand: true,
        category: true,
        variants: true,
        images: { orderBy: { sortOrder: 'asc' } },
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: { customer: { select: { fullName: true, avatarUrl: true } } },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Related products (same category or brand)
    const relatedProducts = await prisma.product.findMany({
      where: {
        id: { not: product.id },
        isPublished: true,
        OR: [{ categoryId: product.categoryId }, { brandId: product.brandId }],
      },
      take: 6,
      include: {
        brand: true,
        category: true,
        variants: true,
      },
    });

    return res.json({
      success: true,
      product,
      relatedProducts,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- ADMIN PRODUCT MANAGEMENT ----------------
export const getAdminProducts = async (req: Request, res: Response) => {
  try {
    const { search, category, brand, stockStatus, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(1, parseInt(limit as string) || 20);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      const searchTerm = String(search).trim();
      where.OR = [
        { name: { contains: searchTerm } },
        { sku: { contains: searchTerm } },
      ];
    }

    if (category && category !== 'all') {
      where.categoryId = String(category);
    }

    if (brand && brand !== 'all') {
      where.brandId = String(brand);
    }

    if (stockStatus === 'OUT_OF_STOCK') {
      where.stockQuantity = { lte: 0 };
    } else if (stockStatus === 'LOW_STOCK') {
      where.stockQuantity = { gt: 0, lte: 5 };
    } else if (stockStatus === 'IN_STOCK') {
      where.stockQuantity = { gt: 5 };
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
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

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      slug,
      sku,
      brandId,
      categoryId,
      shortDesc,
      description,
      specifications,
      warranty,
      regularPrice,
      discountPrice,
      purchasePrice,
      stockQuantity,
      minStockLevel,
      mainImage,
      isPublished,
      isFeatured,
      isBestSeller,
      isNewArrival,
      variants = [],
      images = [],
    } = req.body;

    if (!name || !sku || !brandId || !categoryId || !regularPrice || !mainImage) {
      return res.status(400).json({
        success: false,
        message: 'Product name, SKU, brand, category, regular price, and main image are required.',
      });
    }

    const autoSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Calculate total stock from variants or root
    let totalStock = parseInt(stockQuantity) || 0;
    if (variants && variants.length > 0) {
      totalStock = variants.reduce((acc: number, v: any) => acc + (parseInt(v.stockQuantity) || 0), 0);
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug: autoSlug,
        sku,
        brandId,
        categoryId,
        shortDesc,
        description,
        specifications: typeof specifications === 'object' ? JSON.stringify(specifications) : specifications,
        warranty: warranty || '1 Year Official Warranty',
        regularPrice: parseFloat(regularPrice),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : 0,
        stockQuantity: totalStock,
        minStockLevel: parseInt(minStockLevel) || 5,
        mainImage,
        isPublished: isPublished ?? true,
        isFeatured: isFeatured ?? false,
        isBestSeller: isBestSeller ?? false,
        isNewArrival: isNewArrival ?? true,
      },
    });

    // Create variants if any
    if (variants && variants.length > 0) {
      for (const v of variants) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            name: v.name,
            color: v.color || null,
            colorCode: v.colorCode || null,
            storage: v.storage || null,
            ram: v.ram || null,
            sku: v.sku || `${product.sku}-${Math.floor(1000 + Math.random() * 9000)}`,
            purchasePrice: v.purchasePrice ? parseFloat(v.purchasePrice) : product.purchasePrice,
            regularPrice: v.regularPrice ? parseFloat(v.regularPrice) : product.regularPrice,
            discountPrice: v.discountPrice ? parseFloat(v.discountPrice) : product.discountPrice,
            stockQuantity: parseInt(v.stockQuantity) || 0,
            imageUrl: v.imageUrl || null,
          },
        });
      }
    }

    // Create additional images
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: images[i],
            sortOrder: i,
          },
        });
      }
    }

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: req.user?.id,
        userName: req.user?.fullName || 'Admin',
        action: 'PRODUCT_CREATED',
        entity: 'Product',
        entityId: product.id,
        details: `Created product "${product.name}" with SKU: ${product.sku} and ${variants.length} variants.`,
        ipAddress: req.ip,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product,
    });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      sku,
      brandId,
      categoryId,
      shortDesc,
      description,
      specifications,
      warranty,
      regularPrice,
      discountPrice,
      purchasePrice,
      stockQuantity,
      minStockLevel,
      mainImage,
      isPublished,
      isFeatured,
      isBestSeller,
      isNewArrival,
      variants,
      images,
    } = req.body;

    const existing = await prisma.product.findUnique({ where: { id }, include: { variants: true } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    let totalStock = stockQuantity !== undefined ? parseInt(stockQuantity) : existing.stockQuantity;
    if (variants && Array.isArray(variants)) {
      totalStock = variants.reduce((acc: number, v: any) => acc + (parseInt(v.stockQuantity) || 0), 0);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(sku && { sku }),
        ...(brandId && { brandId }),
        ...(categoryId && { categoryId }),
        ...(shortDesc !== undefined && { shortDesc }),
        ...(description !== undefined && { description }),
        ...(specifications !== undefined && {
          specifications: typeof specifications === 'object' ? JSON.stringify(specifications) : specifications,
        }),
        ...(warranty !== undefined && { warranty }),
        ...(regularPrice !== undefined && { regularPrice: parseFloat(regularPrice) }),
        ...(discountPrice !== undefined && { discountPrice: discountPrice ? parseFloat(discountPrice) : null }),
        ...(purchasePrice !== undefined && { purchasePrice: parseFloat(purchasePrice) }),
        stockQuantity: totalStock,
        ...(minStockLevel !== undefined && { minStockLevel: parseInt(minStockLevel) }),
        ...(mainImage && { mainImage }),
        ...(isPublished !== undefined && { isPublished }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isBestSeller !== undefined && { isBestSeller }),
        ...(isNewArrival !== undefined && { isNewArrival }),
      },
    });

    // Update variants if provided
    if (variants && Array.isArray(variants)) {
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      for (const v of variants) {
        await prisma.productVariant.create({
          data: {
            productId: id,
            name: v.name,
            color: v.color || null,
            colorCode: v.colorCode || null,
            storage: v.storage || null,
            ram: v.ram || null,
            sku: v.sku || `${updated.sku}-${Math.floor(1000 + Math.random() * 9000)}`,
            purchasePrice: v.purchasePrice ? parseFloat(v.purchasePrice) : updated.purchasePrice,
            regularPrice: v.regularPrice ? parseFloat(v.regularPrice) : updated.regularPrice,
            discountPrice: v.discountPrice ? parseFloat(v.discountPrice) : updated.discountPrice,
            stockQuantity: parseInt(v.stockQuantity) || 0,
            imageUrl: v.imageUrl || null,
          },
        });
      }
    }

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: req.user?.id,
        userName: req.user?.fullName || 'Admin',
        action: 'PRODUCT_UPDATED',
        entity: 'Product',
        entityId: id,
        details: `Updated product "${updated.name}" (${updated.sku}).`,
        ipAddress: req.ip,
      },
    });

    return res.json({
      success: true,
      message: 'Product updated successfully.',
      product: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const duplicateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const original = await prisma.product.findUnique({
      where: { id },
      include: { variants: true, images: true },
    });

    if (!original) {
      return res.status(404).json({ success: false, message: 'Original product not found.' });
    }

    const newSku = `${original.sku}-COPY-${Math.floor(100 + Math.random() * 900)}`;
    const newSlug = `${original.slug}-copy-${Math.floor(100 + Math.random() * 900)}`;

    const cloned = await prisma.product.create({
      data: {
        name: `${original.name} (Copy)`,
        slug: newSlug,
        sku: newSku,
        brandId: original.brandId,
        categoryId: original.categoryId,
        shortDesc: original.shortDesc,
        description: original.description,
        specifications: original.specifications,
        warranty: original.warranty,
        regularPrice: original.regularPrice,
        discountPrice: original.discountPrice,
        purchasePrice: original.purchasePrice,
        stockQuantity: original.stockQuantity,
        minStockLevel: original.minStockLevel,
        mainImage: original.mainImage,
        isPublished: false, // Start as draft
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: true,
      },
    });

    for (const v of original.variants) {
      await prisma.productVariant.create({
        data: {
          productId: cloned.id,
          name: v.name,
          color: v.color,
          colorCode: v.colorCode,
          storage: v.storage,
          ram: v.ram,
          sku: `${v.sku}-COPY`,
          purchasePrice: v.purchasePrice,
          regularPrice: v.regularPrice,
          discountPrice: v.discountPrice,
          stockQuantity: v.stockQuantity,
          imageUrl: v.imageUrl,
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Product duplicated successfully as draft.',
      product: cloned,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await prisma.product.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId: req.user?.id,
        userName: req.user?.fullName || 'Admin',
        action: 'PRODUCT_DELETED',
        entity: 'Product',
        entityId: id,
        details: `Deleted product "${product.name}" (${product.sku}).`,
        ipAddress: req.ip,
      },
    });

    return res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- REVIEWS & WISHLIST ----------------
export const addProductReview = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, rating, title, comment } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Product ID, rating (1-5), and review text are required.' });
    }

    const review = await prisma.review.create({
      data: {
        productId,
        customerId: req.user!.id,
        rating: Math.max(1, Math.min(5, parseInt(rating))),
        title: title || '',
        comment,
      },
    });

    // Update product average rating
    const allReviews = await prisma.review.findMany({ where: { productId } });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: parseFloat(avgRating.toFixed(1)),
        ratingCount: allReviews.length,
      },
    });

    return res.status(201).json({ success: true, message: 'Thank you for your review!', review });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.body;
    const customerId = req.user!.id;

    const existing = await prisma.wishlist.findUnique({
      where: { customerId_productId: { customerId, productId } },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { customerId_productId: { customerId, productId } },
      });
      return res.json({ success: true, isWishlisted: false, message: 'Removed from wishlist.' });
    } else {
      await prisma.wishlist.create({
        data: { customerId, productId },
      });
      return res.json({ success: true, isWishlisted: true, message: 'Added to wishlist.' });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
