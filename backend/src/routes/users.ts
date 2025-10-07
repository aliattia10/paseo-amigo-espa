import express from 'express';
import { getUsers, getUserById, updateUser, deleteUser } from '@/controllers/userController';
import { authenticate, authorize } from '@/middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all users (admin only)
router.get('/', authorize('admin'), getUsers);

// Get user by ID
router.get('/:id', getUserById);

// Update user
router.put('/:id', updateUser);

// Delete user
router.delete('/:id', deleteUser);

export default router;
