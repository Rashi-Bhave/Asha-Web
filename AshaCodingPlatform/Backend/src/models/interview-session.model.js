import mongoose from 'mongoose';

// Schema for individual question responses within a session
const interviewResponseSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  response: {
    type: String
  },
  feedback: {
    type: String
  },
  scores: {
    technical: {
      type: Number,
      default: 0
    },
    communication: {
      type: Number,
      default: 0
    }
  },
  nonVerbalMetrics: {
    confidence: {
      type: Number,
      default: 0
    },
    clarity: {
      type: Number,
      default: 0
    },
    eyeContact: {
      type: Number,
      default: 0
    },
    posture: {
      type: Number,
      default: 0
    },
    gestures: {
      type: Number,
      default: 0
    },
    facialExpressions: {
      type: Number,
      default: 0
    }
  },
  voiceMetrics: {
    volume: {
      type: Number,
      default: 0
    },
    pace: {
      type: Number,
      default: 0
    },
    clarity: {
      type: Number,
      default: 0
    },
    fillerWords: {
      type: Object,
      default: {}
    }
  },
  keywordMatches: {
    type: [String],
    default: []
  },
  postureFeedback: {
    type: String
  },
  voiceFeedback: {
    type: String
  },
  responseTime: {
    type: Number,
    default: 0
  }
});

// Schema for full interview sessions
const interviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  duration: {
    type: Number,
    default: 0
  },
  focus: {
    type: [String],
    default: []
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  responses: [interviewResponseSchema],
  overallFeedback: {
    type: String
  },
  overallScore: {
    type: Number
  },
  keyStrengths: {
    type: [String],
    default: []
  },
  developmentAreas: {
    type: [String],
    default: []
  },
  recommendedResources: {
    type: [{
      type: {
        type: String
      },
      title: {
        type: String
      },
      description: {
        type: String
      }
    }],
    default: []
  },
  nextSteps: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  }
}, { timestamps: true });

// Calculate averages method
interviewSessionSchema.methods.calculateAverages = function() {
  if (!this.responses || this.responses.length === 0) return {};
  
  const technicalScores = this.responses.map(r => r.scores.technical).filter(Boolean);
  const communicationScores = this.responses.map(r => r.scores.communication).filter(Boolean);
  const confidenceScores = this.responses.map(r => r.nonVerbalMetrics.confidence).filter(Boolean);
  const clarityScores = this.responses.map(r => r.voiceMetrics.clarity).filter(Boolean);
  
  return {
    avgTechnicalScore: technicalScores.length ? 
      Math.round(technicalScores.reduce((a, b) => a + b, 0) / technicalScores.length) : 0,
    avgCommunicationScore: communicationScores.length ? 
      Math.round(communicationScores.reduce((a, b) => a + b, 0) / communicationScores.length) : 0,
    avgConfidence: confidenceScores.length ? 
      Math.round(confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length) : 0,
    avgClarity: clarityScores.length ? 
      Math.round(clarityScores.reduce((a, b) => a + b, 0) / clarityScores.length) : 0
  };
};

export const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);