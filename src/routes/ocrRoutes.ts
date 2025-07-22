// src/routes/ocrRoutes.ts
import express from 'express';
import upload from '../middleware/uploadMiddleware';
import { ocrController } from '../controllers/ocrController';

const router = express.Router();
router.post('/', upload.fields([{ name: 'adhaarFrontFile' }, { name: 'adhaarBackFile' }]), ocrController);
export default router;
