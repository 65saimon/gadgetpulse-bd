import { Router } from 'express';
import { getCustomers, getCustomerDetails } from '../controllers/customerController';
import { requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', requireAdmin, getCustomers);
router.get('/:id', requireAdmin, getCustomerDetails);

export default router;
