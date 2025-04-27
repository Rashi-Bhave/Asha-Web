import mongoose from 'mongoose';

// Schema for questions in the question bank
const interviewQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['technical', 'behavioral', 'system-design'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  company: {
    type: String
  },
  topics: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Index for search optimization
interviewQuestionSchema.index({ question: 'text', answer: 'text', topics: 'text' });

export const InterviewQuestion = mongoose.model('InterviewQuestion', interviewQuestionSchema);