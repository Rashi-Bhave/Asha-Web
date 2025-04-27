import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express();

// Fix CORS configuration to work with credentials
app.use(cors({
    // Instead of using a wildcard (*), specify the exact origin
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

//Import routes
import userRouter from './routes/user.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import problemRouter from './routes/problem.routes.js'
import runcodeRouter from './routes/runcode.route.js'
import submissionRouter from './routes/submission.routes.js'
import careerRouter from './routes/career.routes.js'
import interviewRouter from './routes/interview.routes.js'
import chatRouter from './routes/chat.routes.js'
import jobRouter from './routes/job.routes.js'
import mentorshipRoutes from './routes/mentorship.routes.js'; // Import mentorship routes
import eventRouter from './routes/event.routes.js'; // Import event routes
import faqChatRoutes from "./routes/faq-chat.routes.js";

//Routes Declaration
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tweet', tweetRouter);
app.use('/api/v1/problem', problemRouter);
app.use('/api/v1/runcode', runcodeRouter);
app.use('/api/v1/submissions', submissionRouter);
app.use('/api/v1/career', careerRouter);
app.use('/api/v1/interview', interviewRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/api/v1/jobs', jobRouter);
app.use("/api/v1/mentorship", mentorshipRoutes); // Add mentorship routes
app.use('/api/v1/events', eventRouter); // Mount event routes
app.use("/api/v1/faq-chat", faqChatRoutes);

export {app}