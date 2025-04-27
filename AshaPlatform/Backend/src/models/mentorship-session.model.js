import mongoose from 'mongoose';

// Schema for mentorship sessions
const mentorshipSessionSchema = new mongoose.Schema({
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionDateTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    default: 60, // Duration in minutes
    min: 15,
    max: 120
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  notes: {
    type: String,
    default: ""
  },
  meetingLink: {
    type: String,
    default: null
  },
  feedbackFromMentor: {
    type: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: String
    },
    default: null
  },
  feedbackFromMentee: {
    type: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: String
    },
    default: null
  },
  followUpActions: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Indexes for faster queries
mentorshipSessionSchema.index({ mentorId: 1, sessionDateTime: 1 });
mentorshipSessionSchema.index({ userId: 1, sessionDateTime: 1 });
mentorshipSessionSchema.index({ status: 1 });

export const MentorshipSession = mongoose.model('MentorshipSession', mentorshipSessionSchema);