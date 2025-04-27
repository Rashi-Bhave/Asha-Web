// Backend/src/models/user-settings.model.js
import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  appearance: {
    darkMode: {
      type: Boolean,
      default: false
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    },
    codeTheme: {
      type: String,
      enum: ['default', 'dark', 'light', 'cyberpunk', 'retro'],
      default: 'cyberpunk'
    },
    accentColor: {
      type: String,
      default: '#7B3FA9' // Default purple accent color
    }
  },
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    jobAlerts: {
      type: Boolean,
      default: true
    },
    eventReminders: {
      type: Boolean,
      default: true
    },
    mentorshipUpdates: {
      type: Boolean,
      default: true
    },
    chatNotifications: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: false
    }
  },
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'connections'],
      default: 'public'
    },
    showOnlineStatus: {
      type: Boolean,
      default: true
    },
    allowMessagesFromNonConnections: {
      type: Boolean,
      default: true
    },
    dataUsageConsent: {
      type: Boolean,
      default: true
    },
    analyticsEnabled: {
      type: Boolean,
      default: true
    }
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'ta', 'te', 'kn', 'mr', 'bn'],
    default: 'en'
  },
  jobPreferences: {
    roles: {
      type: [String],
      default: []
    },
    locations: {
      type: [String],
      default: []
    },
    remoteOnly: {
      type: Boolean,
      default: false
    },
    minimumSalary: {
      type: Number,
      default: 0
    },
    jobTypes: {
      type: [String],
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
      default: ['Full-time']
    },
    experienceLevel: {
      type: [String],
      enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'],
      default: []
    },
    industries: {
      type: [String],
      default: []
    },
    skills: {
      type: [String],
      default: []
    }
  },
  accessibility: {
    highContrast: {
      type: Boolean,
      default: false
    },
    reducedMotion: {
      type: Boolean,
      default: false
    },
    textToSpeech: {
      type: Boolean,
      default: false
    }
  },
  security: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    loginAlerts: {
      type: Boolean,
      default: true
    }
  },
  sessionHistory: {
    lastLogin: {
      type: Date
    },
    lastLogout: {
      type: Date
    },
    deviceInfo: {
      type: [String],
      default: []
    }
  }
}, { timestamps: true });

export const UserSettings = mongoose.model('UserSettings', userSettingsSchema);