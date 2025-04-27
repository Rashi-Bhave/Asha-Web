import { Router } from 'express';
import { 
  getCareerPaths, 
  getCareerPhases, 
  getCareerProgressionData, 
  getNotableWomen, 
  getCareerRecommendations,
  generateCareerRoadmap
} from '../controllers/career.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes (no authentication required)
router.get('/paths', getCareerPaths);
router.get('/phases', getCareerPhases);
router.get('/progression', getCareerProgressionData);
router.get('/notable-women', getNotableWomen);

// Protected routes (require authentication)
router.post('/recommendations', verifyJWT, getCareerRecommendations);
router.post('/roadmap', verifyJWT, generateCareerRoadmap);

export default router;