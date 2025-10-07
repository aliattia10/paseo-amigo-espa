import express from 'express';
import { authenticate } from '@/middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Placeholder routes - implement controllers as needed
router.get('/', (req, res) => res.json({ message: 'Get notifications' }));
router.put('/:id/read', (req, res) => res.json({ message: 'Mark notification as read' }));
router.put('/mark-all-read', (req, res) => res.json({ message: 'Mark all notifications as read' }));

export default router;
