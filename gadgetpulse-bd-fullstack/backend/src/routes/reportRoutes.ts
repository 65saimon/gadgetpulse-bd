import { Router } from 'express';
import {
  getSalesReport,
  getProductSalesReport,
  getInventoryReport,
} from '../controllers/reportController';
import { requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/sales', requireAdmin, getSalesReport);
router.get('/products', requireAdmin, getProductSalesReport);
router.get('/inventory', requireAdmin, getInventoryReport);

export default router;
