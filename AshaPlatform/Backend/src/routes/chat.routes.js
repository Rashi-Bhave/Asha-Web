// Backend/src/routes/chat.routes.js
import { Router } from 'express';
import { 
  processMessage,
  getChatHistory,
  clearChatHistory,
  getChatAnalytics
} from '../controllers/chat.controller.js';
import { verifyJWT, optionalJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// All chat routes require authentication
router.use(verifyJWT);

// Chat routes
router.post('/send', optionalJWT, processMessage);
router.get('/history', getChatHistory);
router.delete('/clear', clearChatHistory);
router.get('/analytics',getChatAnalytics); // New analytics endpoint (admin only)


export default router;



