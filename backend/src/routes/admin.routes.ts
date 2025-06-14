import express from 'express';
import { authenticateJWT, isAdmin, isPrimeAdmin } from '../middleware/auth.middleware';
import adminController from '../controllers/admin.controller';

const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(authenticateJWT);

// Routes accessible by both admin and prime admin
router.get('/users', isAdmin, adminController.getAllUsers);
router.get('/users/:id', isAdmin, adminController.getUserById);
router.put('/users/:id', isAdmin, adminController.updateUser);
router.delete('/users/:id', isAdmin, adminController.deleteUser);

// Routes that require prime admin privileges
router.put('/users/:id/role', isPrimeAdmin, adminController.changeUserRole);

// Admin management routes (prime admin only)
router.get('/admins', isPrimeAdmin, adminController.getAllAdmins);
router.post('/admins', isPrimeAdmin, adminController.createAdmin);
router.delete('/admins/:id', isPrimeAdmin, adminController.deleteAdmin);

// Add this route for debugging
router.get('/debug-auth', (req, res) => {
  res.json({
    headers: req.headers,
    user: req.user,
    message: 'Auth debug info'
  });
});

export default router; 