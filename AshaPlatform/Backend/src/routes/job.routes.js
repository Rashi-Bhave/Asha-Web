// Backend/src/routes/job.routes.js
import { Router } from 'express';
import { 
  getJobs,
  getJobById,
  saveJob,
  unsaveJob,
  applyForJob,
  getAppliedJobs,
  getSavedJobs
} from '../controllers/job.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', getJobs);
router.get('/:id', getJobById);

// Protected routes
router.use(verifyJWT);
router.post('/save/:id', saveJob);
router.delete('/save/:id', unsaveJob);
router.post('/apply/:id', applyForJob);
router.get('/user/applied', getAppliedJobs);
router.get('/user/saved', getSavedJobs);

export default router;

