const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [/.+\@.+\..+/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
    },
    enneagramType: {
      type: Number,
      min: 1,
      max: 9,
    },
    wing: {
      type: Number,
      min: 1,
      max: 9,
    },
    triads: {
      heart: { type: Number, min: 0, max: 100 },
      head: { type: Number, min: 0, max: 100 },
      gut: { type: Number, min: 0, max: 100 }
    },
    healthLevel: {
      type: Number,
      min: 1,
      max: 9,
      default: 5
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    stripeCustomerId: {
      type: String,
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'inactive', 'cancelled'],
      default: 'inactive',
    },
    preferences: {
      darkMode: {
        type: Boolean,
        default: false
      },
      notifications: {
        type: Boolean,
        default: true
      }
    },
    conversationHistory: [{
      timestamp: {
        type: Date,
        default: Date.now
      },
      message: String,
      response: String,
      insights: [{
        category: String,
        content: String
      }]
    }],
    personalDevelopment: {
      goals: [{
        description: String,
        status: {
          type: String,
          enum: ['active', 'completed', 'abandoned'],
          default: 'active'
        },
        progress: {
          type: Number,
          min: 0,
          max: 100,
          default: 0
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }],
      exercises: [{
        name: String,
        description: String,
        frequency: String,
        lastCompleted: Date,
        impact: {
          type: Number,
          min: 1,
          max: 5
        }
      }]
    }
  },
  {
    timestamps: true,
  }
);

// Add index for email field for faster queries
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
