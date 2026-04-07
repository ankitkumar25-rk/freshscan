import express from 'express';
import upload from '../middleware/multer.js';
import { protect } from '../middleware/auth.js';
import { createScan, getScans, getScanById } from '../controllers/scanController.js';

const router = express.Router();

router.post('/scan', protect, upload.single('image'), createScan);
router.get('/scans', protect, getScans);
router.get('/scans/:id', protect, getScanById);

export default router;
