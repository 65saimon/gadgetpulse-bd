import { Router } from 'express';
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../controllers/brandController';
import { requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', getBrands);
router.post('/admin', requireAdmin, createBrand);
router.put('/admin/:id', requireAdmin, updateBrand);
router.delete('/admin/:id', requireAdmin, deleteBrand);

export default router;
