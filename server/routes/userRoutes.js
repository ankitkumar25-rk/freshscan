import express from 'express';
import { getProfile, updateProfile, updatePassword, uploadAvatar } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// Middleware to ensure user is logged in
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', updatePassword);
router.post('/upload-avatar', upload.single('avatar'), uploadAvatar);

export default router;
