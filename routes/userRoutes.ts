import { Router } from 'express';
import UserController from '../controllers/userController.js';
import {
  validateEdit,
  validateLogin,
  validateRegister,
} from '../middleware/validateUserInput.js';
import auth from '../middleware/auth.js';

const router = Router();

router.post('/register', validateRegister, UserController.register);

router.post('/login', validateLogin, UserController.login);

router.get('/me', auth, UserController.getProfile);

router.put('/me', auth, validateEdit, UserController.editProfile);

export default router;
