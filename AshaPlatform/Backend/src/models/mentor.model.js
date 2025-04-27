import mongoose from 'mongoose';

// Schema for mentors
const mentorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  bookings: {
    type: Number,
    default: 0
  },
  callInfo: {
    type: String,
    default: "1:1 Call"
  },
  category: {
    type: String,
    required: true,
    lowercase: true
  },
  subcategories: {
    type: [String],
    default: []
  },
  priorityDM: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: false
  },
  hourlyRate: {
    type: Number,
    default: 0
  },
  availability: {
    type: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      slots: [{
        startTime: String,
        endTime: String
      }]
    }],
    default: []
  },
  bio: {
    type: String,
    default: ""
  },
  skills: {
    type: [String],
    default: []
  },
  education: {
    type: [{
      institution: String,
      degree: String,
      year: String
    }],
    default: []
  },
  experience: {
    type: [{
      company: String,
      position: String,
      duration: String,
      description: String
    }],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Fixed Index for search optimization - Removed subcategories from text index
mentorSchema.index({ 
  name: 'text', 
  title: 'text', 
  bio: 'text', 
  skills: 'text'
});

// Create separate index for category and subcategories for filtering
mentorSchema.index({ category: 1 });
mentorSchema.index({ subcategories: 1 });

export const Mentor = mongoose.model('Mentor', mentorSchema);