import { Router } from 'express';
import WishlistController from '../controllers/wishlistController.js';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  addWishlistItemSchema,
  wishlistItemIdSchema,
} from '../validators/wishlist.js';

const router = Router();

router.get('/', auth, WishlistController.list);
router.post('/items', auth, validate(addWishlistItemSchema), WishlistController.add);
router.delete(
  '/items/:id',
  auth,
  validate(wishlistItemIdSchema),
  WishlistController.remove
);

export default router;
