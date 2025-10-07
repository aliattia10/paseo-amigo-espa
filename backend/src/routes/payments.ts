import express from 'express';
import { authenticate } from '@/middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Placeholder routes - implement controllers as needed
router.get('/methods', (req, res) => res.json({ message: 'Get payment methods' }));
router.post('/methods', (req, res) => res.json({ message: 'Add payment method' }));
router.delete('/methods/:id', (req, res) => res.json({ message: 'Delete payment method' }));
router.post('/process', (req, res) => res.json({ message: 'Process payment' }));

export default router;
