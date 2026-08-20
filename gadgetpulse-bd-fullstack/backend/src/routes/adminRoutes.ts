import { Router } from 'express';
import {
  getDashboardStats,
  getDashboardCharts,
  getActivityLogs,
} from '../controllers/adminController';
import { requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/stats', requireAdmin, getDashboardStats);
router.get('/charts', requireAdmin, getDashboardCharts);
router.get('/activities', requireAdmin, getActivityLogs);

export default router;
