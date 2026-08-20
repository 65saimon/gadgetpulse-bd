import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  getAdminProducts,
  createProduct,
  updateProduct,
  duplicateProduct,
  deleteProduct,
  addProductReview,
  toggleWishlist,
} from '../controllers/productController';
import { requireAdmin, requireCustomer } from '../middleware/auth';

const router = Router();

// Public storefront
router.get('/', getProducts);
router.get('/detail/:slug', getProductBySlug);

// Customer actions
router.post('/review', requireCustomer, addProductReview);
router.post('/wishlist/toggle', requireCustomer, toggleWishlist);

// Admin actions
router.get('/admin/list', requireAdmin, getAdminProducts);
router.post('/admin', requireAdmin, createProduct);
router.put('/admin/:id', requireAdmin, updateProduct);
router.post('/admin/:id/duplicate', requireAdmin, duplicateProduct);
router.delete('/admin/:id', requireAdmin, deleteProduct);

export default router;
