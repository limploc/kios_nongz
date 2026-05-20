import { Router } from 'express';
import PaymentController from '../controllers/paymentController.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import validate from '../middleware/validate.js';
import { uploadPaymentProofSchema } from '../validators/payments.js';

const router = Router();

router.post(
  '/upload-proof',
  auth,
  upload.single('file'),
  validate(uploadPaymentProofSchema),
  PaymentController.uploadProof
);

export default router;
