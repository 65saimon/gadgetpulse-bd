import { Router } from 'express';
import { getPurchases, createPurchase } from '../controllers/supplierController';
import { requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', requireAdmin, getPurchases);
router.post('/', requireAdmin, createPurchase);

export default router;
