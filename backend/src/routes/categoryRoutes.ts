import { Router } from 'express';
import {
  getCategories,
  getAllCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', getCategories);
router.get('/admin', requireAdmin, getAllCategoriesAdmin);
router.post('/admin', requireAdmin, createCategory);
router.put('/admin/:id', requireAdmin, updateCategory);
router.delete('/admin/:id', requireAdmin, deleteCategory);

export default router;
