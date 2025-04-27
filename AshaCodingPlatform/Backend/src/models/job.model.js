// Backend/src/models/job.model.js
import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  company: {
    type: String,
    required: true,
    index: true
  },
  location: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
    default: 'Full-time'
  },
  salary: {
    type: String,
  },
  description: {
    type: String,
    required: true
  },
  postedDate: {
    type: Date,
    default: Date.now
  },
  applyUrl: {
    type: String
  },
  logo: {
    type: String
  },
  skills: {
    type: [String],
    default: []
  },
  experienceLevel: {
    type: String,
    enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive', 'Not specified'],
    default: 'Not specified'
  },
  industry: {
    type: String
  },
  remoteJob: {
    type: Boolean,
    default: false
  },
  // For job applications tracking
  applicants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['Applied', 'Viewed', 'Interviewing', 'Rejected', 'Offered', 'Hired'],
      default: 'Applied'
    },
    appliedDate: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  // For user job bookmarks
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // For analytics and relevance ranking
  viewCount: {
    type: Number,
    default: 0
  },
  applyCount: {
    type: Number,
    default: 0
  },
  source: {
    type: String,
    default: 'API'
  },
  // For job search relevance
  searchScore: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Create text index for searching
jobSchema.index({ 
  title: 'text', 
  company: 'text', 
  description: 'text',
  skills: 'text'
});

// Helper methods
jobSchema.methods.isRecentlyPosted = function() {
  const now = new Date();
  const postedDate = new Date(this.postedDate);
  const diffTime = Math.abs(now - postedDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= 7; // Within last 7 days
};

export const Job = mongoose.model('Job', jobSchema);