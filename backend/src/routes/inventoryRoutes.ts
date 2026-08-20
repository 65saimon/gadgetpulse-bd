import { Router } from 'express';
import {
  getInventoryOverview,
  getInventoryList,
  adjustStock,
  getStockMovementHistory,
} from '../controllers/inventoryController';
import { requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/overview', requireAdmin, getInventoryOverview);
router.get('/list', requireAdmin, getInventoryList);
router.post('/adjust', requireAdmin, adjustStock);
router.get('/history', requireAdmin, getStockMovementHistory);

export default router;
