import { Router } from 'express';
import { getStoreSettings, updateStoreSettings } from '../controllers/settingController';
import { requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', getStoreSettings);
router.post('/', requireAdmin, updateStoreSettings);

export default router;
