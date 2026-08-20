import { Router } from 'express';
import {
  createOrder,
  getCustomerOrders,
  getAdminOrders,
  getOrderById,
  trackOrderPublic,
  updateOrderStatus,
} from '../controllers/orderController';
import { requireAdmin, requireCustomer, optionalCustomer } from '../middleware/auth';

const router = Router();

// Storefront
router.post('/checkout', optionalCustomer, createOrder);
router.get('/customer', requireCustomer, getCustomerOrders);
router.get('/track', trackOrderPublic);

// Admin
router.get('/admin/list', requireAdmin, getAdminOrders);
router.get('/:id', getOrderById);
router.put('/admin/:id/status', requireAdmin, updateOrderStatus);

export default router;
