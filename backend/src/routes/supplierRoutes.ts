import { Router } from 'express';
import { getSuppliers, createSupplier, updateSupplier } from '../controllers/supplierController';
import { requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', requireAdmin, getSuppliers);
router.post('/', requireAdmin, createSupplier);
router.put('/:id', requireAdmin, updateSupplier);

export default router;
