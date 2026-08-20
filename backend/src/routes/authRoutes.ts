import { Router } from 'express';
import {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  updateCustomerProfile,
  loginAdmin,
  getAdminProfile,
} from '../controllers/authController';
import { requireAdmin, requireCustomer } from '../middleware/auth';

const router = Router();

// Customer Auth
router.post('/customer/register', registerCustomer);
router.post('/customer/login', loginCustomer);
router.get('/customer/profile', requireCustomer, getCustomerProfile);
router.put('/customer/profile', requireCustomer, updateCustomerProfile);

// Admin Auth
router.post('/admin/login', loginAdmin);
router.get('/admin/profile', requireAdmin, getAdminProfile);

export default router;
