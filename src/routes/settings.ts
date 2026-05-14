import { Router } from 'express';
import { publicGetSettings } from '../admin/controllers/settings.admin';

const router = Router();
router.get('/', publicGetSettings);

export default router;
