// Backend/src/models/event.model.js
import mongoose from 'mongoose';

const speakerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  role: {
    type: String
  },
  image: {
    type: String
  }
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  virtual: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    // enum: ['Conference', 'Workshop', 'Hackathon', 'Webinar', 'Meetup', 'Community Connect', 'Event'],
    default: 'Event'
  },
  image: {
    type: String
  },
  registrationUrl: {
    type: String
  },
  price: {
    type: String,
    default: 'Free'
  },
  speakers: [speakerSchema],
  organizer: {
    type: String
  },
  // For event registrations tracking
  attendees: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Registered', 'Attended', 'Cancelled'],
      default: 'Registered'
    }
  }],
  // For user event bookmarks
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // For women-focused events
  forWomen: {
    type: Boolean,
    default: false
  },
  // For analytics
  viewCount: {
    type: Number,
    default: 0
  },
  registrationCount: {
    type: Number,
    default: 0
  },
  source: {
    type: String,
    default: 'API'
  },
  // Reference to ChromaDB ID
  chromaId: {
    type: String,
    index: true
  }
}, { timestamps: true });

// Create text index for searching
eventSchema.index({ 
  title: 'text', 
  description: 'text',
  location: 'text',
  category: 'text'
});

// Helper methods
eventSchema.methods.isUpcoming = function() {
  const now = new Date();
  const eventDate = new Date(this.date);
  return eventDate > now;
};

export const Event = mongoose.model('Event', eventSchema);