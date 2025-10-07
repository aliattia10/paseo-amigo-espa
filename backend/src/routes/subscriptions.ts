import express from 'express';
import { authenticate } from '@/middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Placeholder routes - implement controllers as needed
router.get('/plans', (req, res) => res.json({ message: 'Get subscription plans' }));
router.get('/current', (req, res) => res.json({ message: 'Get current subscription' }));
router.post('/subscribe', (req, res) => res.json({ message: 'Subscribe to plan' }));
router.put('/cancel', (req, res) => res.json({ message: 'Cancel subscription' }));

export default router;
