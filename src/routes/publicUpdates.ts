import { Router } from 'express';
import { getUpdates, createUpdate, deleteUpdate } from '../controllers/publicUpdateController';
import { protect, adminOnly } from '../middleware/auth';
import { uploadMediaDisk } from '../middleware/upload';

const router = Router();
router.get('/', getUpdates);
router.post('/', protect, adminOnly, uploadMediaDisk.array('media', 20), createUpdate);
router.delete('/:id', protect, adminOnly, deleteUpdate);
export default router;
