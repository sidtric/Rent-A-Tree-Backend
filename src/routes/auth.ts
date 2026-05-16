import { Router } from 'express';
import { register, login, getMe, updateProfile, sendOtp, verifyOtp, googleAuth } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/google', googleAuth);
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
