import { Router } from 'express';
import UploadController from '../controllers/uploadController.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

router.post('/image', auth, upload.single('file'), UploadController.uploadImage);

export default router;
