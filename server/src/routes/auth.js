import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, me, checkUserId } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('userId').notEmpty().withMessage('User ID is required').isLength({ min: 3 }).withMessage('User ID must be at least 3 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  register,
);

router.get('/check-userid/:userId', checkUserId);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login,
);

router.get('/me', authMiddleware, me);

export default router;
