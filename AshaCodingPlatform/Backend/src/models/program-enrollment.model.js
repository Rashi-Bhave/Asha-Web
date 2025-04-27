import mongoose from 'mongoose';

// Schema for program enrollments
const programEnrollmentSchema = new mongoose.Schema({
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MentorshipProgram',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped', 'deferred'],
    default: 'active'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  nextSession: {
    type: Date,
    default: null
  },
  assignments: {
    completed: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  notes: {
    type: String,
    default: ""
  },
  feedback: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Compound index to ensure a user can only enroll once per program
programEnrollmentSchema.index({ userId: 1, programId: 1 }, { unique: true });

export const ProgramEnrollment = mongoose.model('ProgramEnrollment', programEnrollmentSchema);