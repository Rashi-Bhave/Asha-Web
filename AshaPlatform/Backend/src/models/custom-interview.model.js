import mongoose from 'mongoose';

// Schema for custom interview questions
const customQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['technical', 'behavioral', 'mixed'],
    required: true
  },
  rationale: {
    type: String
  },
  expectedAnswer: {
    type: String
  }
});

// Schema for custom interview configurations
const customInterviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: function() {
      return `${this.role} ${this.interviewType} Interview`;
    }
  },
  interviewType: {
    type: String,
    enum: ['technical', 'behavioral', 'mixed'],
    required: true
  },
  role: {
    type: String,
    required: true
  },
  seniority: {
    type: String,
    enum: ['junior', 'mid', 'senior'],
    required: true
  },
  specificTechnologies: {
    type: [String],
    default: []
  },
  companyValues: {
    type: [String],
    default: []
  },
  questionsNeeded: {
    type: Number,
    default: 5
  },
  customRequirements: {
    type: String
  },
  questions: [customQuestionSchema],
  isPublic: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export const CustomInterview = mongoose.model('CustomInterview', customInterviewSchema);