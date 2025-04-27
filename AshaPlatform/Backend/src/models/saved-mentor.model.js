import mongoose from 'mongoose';

// Schema for mentors saved by users
const savedMentorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor',
    required: true
  },
  notes: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Compound index to ensure a user can only save a mentor once
savedMentorSchema.index({ userId: 1, mentorId: 1 }, { unique: true });

export const SavedMentor = mongoose.model('SavedMentor', savedMentorSchema);