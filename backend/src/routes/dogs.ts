import express from 'express';
import { authenticate } from '@/middleware/auth';
import { 
  getDogs, 
  getDogById, 
  createDog, 
  updateDog, 
  deleteDog 
} from '@/controllers/dogController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.route('/')
  .get(getDogs)
  .post(createDog);

router.route('/:id')
  .get(getDogById)
  .put(updateDog)
  .delete(deleteDog);

export default router;
