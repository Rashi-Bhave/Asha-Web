// Backend/src/models/chat-message.model.js
import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'bot'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  attachment: {
    type: {
      type: String,
      enum: ['job', 'event', 'mentorship', 'image', 'link', 'options', 'jobs', null],
      default: null
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  intentCategory: {
    type: String,
    enum: [
      'Career_Trajectory_Switch', 
      'Job_Listing', 
      'Events_Listings', 
      'Mock_Interview', 
      'Coding_Platform', 
      'Other_Professional', 
      'Other_Generic',
      'SignUp_Intent',
      'Bias_Redirection'  // New category for bias redirection
    ],
    default: 'Other_Generic'
  },
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral'
  },
  topics: {
    type: [String],
    default: []
  },
  thread: {
    type: String,
    default: 'main'
  },
  mode: {
    type: String,
    enum: ['creative', 'balanced', 'precise'],
    default: 'balanced'
  },
  persona: {
    type: String,
    enum: ['assistant', 'coach', 'mentor', 'analyst'],
    default: 'assistant'
  },
  // Bias detection fields
  biasDetected: {
    type: Boolean,
    default: false
  },
  biasScore: {
    type: Number,
    default: 0
  },
  biasCategory: {
    type: String,
    default: null
  },
  biasRedirected: {
    type: Boolean,
    default: false
  },
  biasRedirectionEffective: {
    type: Boolean,
    default: null
  },
  analyticsData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// Index for searching through messages
chatMessageSchema.index({ text: 'text' });

// Method to convert to frontend format
chatMessageSchema.methods.toFrontend = function() {
  return {
    id: this._id,
    text: this.text,
    sender: this.sender,
    timestamp: this.timestamp,
    attachment: this.attachment,
    sentiment: this.sentiment,
    topics: this.topics,
    thread: this.thread,
    intentCategory: this.intentCategory,
    biasDetected: this.biasDetected,
    biasRedirected: this.biasRedirected
  };
};

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);