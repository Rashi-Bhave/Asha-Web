// Backend/src/models/mentorship.model.js
import mongoose from 'mongoose';

const mentorshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  mentor: {
    type: String,
    required: true
  },
  mentorTitle: {
    type: String
  },
  focus: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  format: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  industry: {
    type: String
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  commitmentHours: {
    type: String
  },
  application: {
    type: String
  },
  // Maximum number of mentees
  capacity: {
    type: Number,
    default: 5
  },
  // For tracking applicants
  applicants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Applied', 'Accepted', 'Rejected', 'Waitlisted'],
      default: 'Applied'
    },
    notes: String
  }],
  // Accepted mentees
  mentees: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinDate: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number, // 0-100%
      default: 0
    },
    completionStatus: {
      type: String,
      enum: ['In Progress', 'Completed', 'Dropped'],
      default: 'In Progress'
    }
  }],
  // For user bookmarks
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // For analytics
  viewCount: {
    type: Number,
    default: 0
  },
  applicationCount: {
    type: Number,
    default: 0
  },
  // For user rating after completion
  ratings: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number, // 1-5
      min: 1,
      max: 5
    },
    review: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  // Average rating
  averageRating: {
    type: Number,
    default: 0
  },
  // Status of the mentorship program
  status: {
    type: String,
    enum: ['Open', 'Closed', 'Completed'],
    default: 'Open'
  }
}, { timestamps: true });

// Create text index for searching
mentorshipSchema.index({ 
  title: 'text',
  mentor: 'text',
  focus: 'text',
  description: 'text',
  industry: 'text'
});

// Helper methods
mentorshipSchema.methods.isFull = function() {
  return this.mentees.length >= this.capacity;
};

mentorshipSchema.methods.isOpen = function() {
  return this.status === 'Open' && !this.isFull();
};

mentorshipSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) return 0;
  
  const total = this.ratings.reduce((sum, item) => sum + item.rating, 0);
  return total / this.ratings.length;
};

// Update average rating before saving
mentorshipSchema.pre('save', function(next) {
  if (this.ratings && this.ratings.length > 0) {
    this.averageRating = this.calculateAverageRating();
  }
  next();
});

export const Mentorship = mongoose.model('Mentorship', mentorshipSchema);