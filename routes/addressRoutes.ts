import { Router } from 'express';
import AddressController from '../controllers/addressController.js';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  addressIdSchema,
  createAddressSchema,
  updateAddressSchema,
} from '../validators/addresses.js';

const router = Router();

router.get('/', auth, AddressController.list);
router.post('/', auth, validate(createAddressSchema), AddressController.create);
router.patch(
  '/:id',
  auth,
  validate(updateAddressSchema),
  AddressController.update
);
router.delete(
  '/:id',
  auth,
  validate(addressIdSchema),
  AddressController.remove
);

export default router;
