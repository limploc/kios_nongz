import { Router } from 'express';
import CartController from '../controllers/cartController.js';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  addCartItemSchema,
  cartItemIdSchema,
  updateCartItemSchema,
} from '../validators/cart.js';

const router = Router();

router.get('/', auth, CartController.getCart);
router.post('/items', auth, validate(addCartItemSchema), CartController.addItem);
router.patch(
  '/items/:id',
  auth,
  validate(updateCartItemSchema),
  CartController.updateItem
);
router.delete(
  '/items/:id',
  auth,
  validate(cartItemIdSchema),
  CartController.removeItem
);

export default router;
