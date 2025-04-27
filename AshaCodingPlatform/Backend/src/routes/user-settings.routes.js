// Backend/src/routes/user-settings.routes.js
import { Router } from 'express';
import { 
  getUserSettings,
  updateUserSettings,
  resetUserSettings
} from '../controllers/user-settings.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// All settings routes require authentication
router.use(verifyJWT);

router.get('/', getUserSettings);
router.put('/', updateUserSettings);
router.post('/reset', resetUserSettings);

export default router;