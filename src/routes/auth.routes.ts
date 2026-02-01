import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();
const authController = new AuthController();

// public routes
router.post('/register', asyncHandler(authController.register.bind(authController)));
router.post('/login', asyncHandler(authController.login.bind(authController)));

export default router;
