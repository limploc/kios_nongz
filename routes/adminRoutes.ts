import { Router } from 'express';
import AdminDashboardController from '../controllers/adminDashboardController.js';
import AdminCategoryController from '../controllers/adminCategoryController.js';
import AdminOrderController from '../controllers/adminOrderController.js';
import AdminPaymentController from '../controllers/adminPaymentController.js';
import AdminProductController from '../controllers/adminProductController.js';
import adminOnly from '../middleware/admin.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import validate from '../middleware/validate.js';
import {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
} from '../validators/adminCategories.js';
import {
  createProductSchema,
  listAdminProductsSchema,
  productIdSchema,
  updateProductSchema,
  uploadProductImageSchema,
} from '../validators/adminProducts.js';
import {
  createProductImageSchema,
  productImageIdSchema,
  updateProductImageSchema,
} from '../validators/adminProductImages.js';
import {
  adminOrderIdSchema,
  listAdminOrdersSchema,
  updateOrderStatusSchema,
} from '../validators/adminOrders.js';
import {
  adminPaymentIdSchema,
  listAdminPaymentsSchema,
} from '../validators/adminPayments.js';

const router = Router();

router.use(auth, adminOnly);

router.get('/dashboard', AdminDashboardController.stats);

router.get('/categories', AdminCategoryController.list);
router.post('/categories', validate(createCategorySchema), AdminCategoryController.create);
router.patch(
  '/categories/:id',
  validate(updateCategorySchema),
  AdminCategoryController.update
);
router.put(
  '/categories/:id',
  validate(updateCategorySchema),
  AdminCategoryController.update
);
router.delete(
  '/categories/:id',
  validate(categoryIdSchema),
  AdminCategoryController.remove
);

router.get('/products', validate(listAdminProductsSchema), AdminProductController.list);
router.post('/products', validate(createProductSchema), AdminProductController.create);
router.patch(
  '/products/:id',
  validate(updateProductSchema),
  AdminProductController.update
);
router.put(
  '/products/:id',
  validate(updateProductSchema),
  AdminProductController.update
);
router.delete(
  '/products/:id',
  validate(productIdSchema),
  AdminProductController.remove
);

router.post(
  '/products/:id/images',
  validate(createProductImageSchema),
  AdminProductController.addImage
);
router.post(
  '/products/:id/images/upload',
  upload.single('file'),
  validate(uploadProductImageSchema),
  AdminProductController.addImageUpload
);
router.patch(
  '/products/:id/images/:imageId',
  validate(updateProductImageSchema),
  AdminProductController.updateImage
);
router.delete(
  '/products/:id/images/:imageId',
  validate(productImageIdSchema),
  AdminProductController.removeImage
);

router.get('/orders', validate(listAdminOrdersSchema), AdminOrderController.list);
router.get('/orders/:id', validate(adminOrderIdSchema), AdminOrderController.detail);
router.put(
  '/orders/:id/status',
  validate(updateOrderStatusSchema),
  AdminOrderController.updateStatus
);

router.get(
  '/payments',
  validate(listAdminPaymentsSchema),
  AdminPaymentController.list
);
router.get(
  '/payments/:id',
  validate(adminPaymentIdSchema),
  AdminPaymentController.detail
);
router.put(
  '/payments/:id/approve',
  validate(adminPaymentIdSchema),
  AdminPaymentController.approve
);
router.put(
  '/payments/:id/reject',
  validate(adminPaymentIdSchema),
  AdminPaymentController.reject
);

export default router;
