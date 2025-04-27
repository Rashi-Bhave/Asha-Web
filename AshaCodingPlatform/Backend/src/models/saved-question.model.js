import mongoose from 'mongoose';

// Schema for tracking user's saved questions
const savedQuestionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewQuestion',
    required: true
  },
  notes: {
    type: String
  },
  tags: {
    type: [String],
    default: []
  },
  lists: {
    type: [String],
    default: ['Saved']  // Default list name
  }
}, { timestamps: true });

// Compound index to prevent duplicates
savedQuestionSchema.index({ userId: 1, questionId: 1 }, { unique: true });

export const SavedQuestion = mongoose.model('SavedQuestion', savedQuestionSchema);