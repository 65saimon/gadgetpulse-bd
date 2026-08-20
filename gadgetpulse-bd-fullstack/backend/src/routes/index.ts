import { Router } from 'express';
import authRoutes from './authRoutes';
import productRoutes from './productRoutes';
import categoryRoutes from './categoryRoutes';
import brandRoutes from './brandRoutes';
import orderRoutes from './orderRoutes';
import invoiceRoutes from './invoiceRoutes';
import inventoryRoutes from './inventoryRoutes';
import customerRoutes from './customerRoutes';
import supplierRoutes from './supplierRoutes';
import purchaseRoutes from './purchaseRoutes';
import reportRoutes from './reportRoutes';
import adminRoutes from './adminRoutes';
import settingRoutes from './settingRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/orders', orderRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/customers', customerRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);
router.use('/settings', settingRoutes);

export default router;
