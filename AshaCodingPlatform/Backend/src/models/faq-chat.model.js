// Backend/src/models/faq-chat.model.js
import mongoose from 'mongoose';

const faqChatMessageSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Not required since unauthenticated users can use FAQ chat
    default: null
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
      enum: ['link', 'signup', 'options', null],
      default: null
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  category: {
    type: String,
    enum: [
      'platform_info', 
      'account_help', 
      'features', 
      'pricing', 
      'technical_issues',
      'signup_assistance',
      'other'
    ],
    default: 'other'
  },
  helpfulnessRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  context: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// Index for searching through messages
faqChatMessageSchema.index({ text: 'text' });
faqChatMessageSchema.index({ sessionId: 1, timestamp: 1 });

// Method to convert to frontend format
faqChatMessageSchema.methods.toFrontend = function() {
  return {
    id: this._id,
    text: this.text,
    sender: this.sender,
    timestamp: this.timestamp,
    attachment: this.attachment,
    category: this.category
  };
};

// Static method to create a new session ID
faqChatMessageSchema.statics.createSessionId = function() {
  // Generate a unique session ID
  return `faq_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

// Static method to get recent messages by session ID
faqChatMessageSchema.statics.getSessionMessages = async function(sessionId, limit = 10) {
  return this.find({ sessionId })
    .sort({ timestamp: 1 })
    .limit(limit);
};

// Add statistics methods
faqChatMessageSchema.statics.getFrequentQuestions = async function(startDate, endDate, limit = 10) {
  const pipeline = [
    {
      $match: {
        sender: 'user',
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: { $toLower: '$text' },
        count: { $sum: 1 },
        originalText: { $first: '$text' }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        _id: 0,
        text: '$originalText',
        count: 1
      }
    }
  ];

  return this.aggregate(pipeline);
};

export const FAQChatMessage = mongoose.model('FAQChatMessage', faqChatMessageSchema);