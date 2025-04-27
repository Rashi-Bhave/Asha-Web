import mongoose from 'mongoose';

// Schema for mentorship programs
const mentorshipProgramSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    lowercase: true
  },
  format: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: null
  },
  requiredSkills: {
    type: [String],
    default: []
  },
  syllabus: {
    type: [{
      week: Number,
      title: String,
      description: String,
      activities: [String]
    }],
    default: []
  },
  price: {
    type: Number,
    default: 0
  },
  maxParticipants: {
    type: Number,
    default: 10
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Indexes for search optimization
mentorshipProgramSchema.index({ 
  title: 'text', 
  description: 'text',
  category: 1,
  industry: 1
});

export const MentorshipProgram = mongoose.model('MentorshipProgram', mentorshipProgramSchema);