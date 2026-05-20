import { Router } from 'express';
import OrderController from '../controllers/orderController.js';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  checkoutSchema,
  listOrdersSchema,
  orderIdSchema,
} from '../validators/orders.js';

const router = Router();

router.post('/checkout', auth, validate(checkoutSchema), OrderController.checkout);
router.get('/', auth, validate(listOrdersSchema), OrderController.list);
router.get('/:id', auth, validate(orderIdSchema), OrderController.detail);

export default router;
