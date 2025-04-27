// backend/src/routes/mentorship.routes.js
import { Router } from 'express';
import { 
  getMentors,
  getMentorById,
  bookSession,
  getUserSessions,
  getSessionById,
  updateSession,
  saveMentor,
  getSavedMentors,
  removeSavedMentor,
  getPrograms,
  enrollInProgram,
  getUserEnrollments,
  getCategories,
  getSessionDetails,
  getMentorSessions
} from '../controllers/mentorship.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes (no authentication required)
router.get('/mentors', getMentors);
router.get('/mentors/:id', getMentorById);
router.get('/programs', getPrograms);
router.get('/categories', getCategories);

// Protected routes (require authentication)
router.post('/sessions/book', verifyJWT, bookSession);
router.get('/sessions', verifyJWT, getUserSessions);
router.get('/sessions/:id', verifyJWT, getSessionById);
router.put('/sessions/:id', verifyJWT, updateSession);
router.get('/sessions/:id/details', getSessionDetails);


router.post('/saved/add', verifyJWT, saveMentor);
router.get('/saved', verifyJWT, getSavedMentors);
router.delete('/saved/:mentorId', verifyJWT, removeSavedMentor);

router.post('/programs/enroll', verifyJWT, enrollInProgram);
router.get('/enrollments', verifyJWT, getUserEnrollments);
router.get('/mentors/:id/sessions', getMentorSessions);

export default router;