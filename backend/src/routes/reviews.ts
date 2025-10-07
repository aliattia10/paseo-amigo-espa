import express from 'express';
import { authenticate } from '@/middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Placeholder routes - implement controllers as needed
router.get('/user/:userId', (req, res) => res.json({ message: 'Get reviews for user' }));
router.post('/', (req, res) => res.json({ message: 'Create review' }));
router.put('/:id', (req, res) => res.json({ message: 'Update review' }));
router.delete('/:id', (req, res) => res.json({ message: 'Delete review' }));

export default router;
