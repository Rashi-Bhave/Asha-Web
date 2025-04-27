// Backend/src/routes/faq-chat.routes.js
import { Router } from 'express';
import { 
  processFAQMessage,
  getFAQChatHistory,
  submitFAQFeedback,
  getFAQAnalytics
} from '../controllers/faq-chat.controller.js';
// import { verifyJWT, optionalJWT, adminOnly } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes (no auth required)
router.post('/send', processFAQMessage);
router.get('/history/:sessionId', getFAQChatHistory);
router.post('/feedback', submitFAQFeedback);

// Admin only routes
// router.get('/analytics', verifyJWT, adminOnly, getFAQAnalytics);

export default router;