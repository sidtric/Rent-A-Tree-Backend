import { Router } from 'express';
import { getAllTrees, getTree, createTree, updateTree, deleteTree } from '../controllers/treeController';
import { protect, adminOnly } from '../middleware/auth';
import { uploadImage } from '../middleware/upload';

const router = Router();
router.get('/', getAllTrees);
router.get('/:id', getTree);
router.post('/', protect, adminOnly, uploadImage.single('image'), createTree);
router.patch('/:id', protect, adminOnly, uploadImage.single('image'), updateTree);
router.delete('/:id', protect, adminOnly, deleteTree);
export default router;
