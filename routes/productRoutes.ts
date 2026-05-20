import { Router } from 'express';
import ProductController from '../controllers/productController.js';
import validate from '../middleware/validate.js';
import { listProductsSchema, productIdSchema } from '../validators/products.js';

const router = Router();

router.get('/', validate(listProductsSchema), ProductController.list);
router.get('/:id', validate(productIdSchema), ProductController.detail);

export default router;
