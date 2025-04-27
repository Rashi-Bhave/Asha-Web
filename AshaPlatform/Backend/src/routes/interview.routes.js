// backend/src/routes/interview.routes.js
import { Router } from 'express';
import { 
  generateInterviewQuestions,
  analyzeResponse,
  generateOverallFeedback,
  generateCustomQuestions,
  analyzeVideoData,
  analyzeAudioData,
  getInterviewSessions,
  getInterviewSession,
  getQuestionBank,
  addQuestion,
  saveQuestion,
  getSavedQuestions,
  removeSavedQuestion,
  getCustomInterviews,
  getCustomInterview
} from '../controllers/interview.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes (no authentication required)
router.post('/generate-questions', generateInterviewQuestions);
router.post('/analyze-response', analyzeResponse);
router.post('/overall-feedback', generateOverallFeedback);
router.post('/custom-questions', generateCustomQuestions);
router.post('/analyze-video', analyzeVideoData);
router.post('/analyze-audio', analyzeAudioData);
router.get('/question-bank', getQuestionBank);

// Protected routes (require authentication)
router.get('/sessions', verifyJWT, getInterviewSessions);
router.get('/sessions/:sessionId', verifyJWT, getInterviewSession);
router.post('/question-bank/add', verifyJWT, addQuestion);
router.post('/save-question', verifyJWT, saveQuestion);
router.get('/saved-questions', verifyJWT, getSavedQuestions);
router.delete('/saved-questions/:id', verifyJWT, removeSavedQuestion);
router.get('/custom-interviews', verifyJWT, getCustomInterviews);
router.get('/custom-interviews/:id', verifyJWT, getCustomInterview);

export default router;