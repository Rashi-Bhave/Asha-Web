// Backend/src/routes/event.routes.js
import { Router } from 'express';
import { 
  getEvents,
  getEventById,
  saveEvent,
  unsaveEvent,
  registerForEvent,
  getRegisteredEvents,
  getSavedEvents
} from '../controllers/event.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', getEvents);
router.get('/:id', getEventById);

// Protected routes
router.use(verifyJWT);
router.post('/save/:id', saveEvent);
router.delete('/save/:id', unsaveEvent);
router.post('/register/:id', registerForEvent);
router.get('/user/registered', getRegisteredEvents);
router.get('/user/saved', getSavedEvents);

export default router;

