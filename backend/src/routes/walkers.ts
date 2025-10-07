import express from 'express';
import { authenticate } from '@/middleware/auth';
import { 
  getWalkers, 
  getWalkerById, 
  createWalkerProfile, 
  updateWalkerProfile 
} from '@/controllers/walkerController';

const router = express.Router();

// Get all walkers (public)
router.get('/', getWalkers);

// All other routes require authentication
router.use(authenticate);

router.route('/:id')
  .get(getWalkerById);

router.route('/profile')
  .post(createWalkerProfile)
  .put(updateWalkerProfile);

export default router;
