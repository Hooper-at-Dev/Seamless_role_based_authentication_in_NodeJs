import express from 'express';
import userController from '../controllers/user.controller';
import { authenticateJWT, ensureEmailVerified } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all user routes
router.use(authenticateJWT);
router.use(ensureEmailVerified);

// Get user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.put('/profile', userController.updateProfile);

// Change password
router.put('/change-password', userController.changePassword);

export default router; 