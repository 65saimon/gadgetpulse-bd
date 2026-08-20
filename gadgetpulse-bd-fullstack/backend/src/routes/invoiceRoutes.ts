import { Router } from 'express';
import { getInvoices, getInvoiceById } from '../controllers/invoiceController';
import { requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', requireAdmin, getInvoices);
router.get('/:id', getInvoiceById); // Allow invoice preview with link or auth

export default router;
