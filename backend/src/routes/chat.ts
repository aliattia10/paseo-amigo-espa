import express from 'express';
import { authenticate } from '@/middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Placeholder routes - implement controllers as needed
router.get('/:requestId', (req, res) => res.json({ message: 'Get chat messages' }));
router.post('/:requestId', (req, res) => res.json({ message: 'Send message' }));

export default router;
