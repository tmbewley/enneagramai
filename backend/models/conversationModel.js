const mongoose = require('mongoose');

const conversationSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  
  messages: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    metadata: {
      emotionalTone: String,
      topics: [String],
      enneagramReferences: [{
        type: Number,
        min: 1,
        max: 9
      }],
      theoriesReferenced: [{
        category: {
          type: String,
          enum: ['enneagram', 'gurdjieff', 'neuroscience', 'consciousness']
        },
        concept: String
      }]
    }
  }],
  
  analysis: {
    dominantThemes: [String],
    psychologicalInsights: [{
      category: String,
      description: String,
      confidence: {
        type: Number,
        min: 0,
        max: 1
      }
    }],
    personalGrowth: {
      challenges: [String],
      strengths: [String],
      recommendations: [{
        type: String,
        priority: {
          type: Number,
          min: 1,
          max: 5
        }
      }]
    },
    enneagramDynamics: {
      primaryType: {
        type: Number,
        min: 1,
        max: 9
      },
      wing: {
        type: Number,
        min: 1,
        max: 9
      },
      stressDirection: {
        type: Number,
        min: 1,
        max: 9
      },
      growthDirection: {
        type: Number,
        min: 1,
        max: 9
      },
      healthLevel: {
        type: Number,
        min: 1,
        max: 9
      }
    }
  },
  
  sessionMetrics: {
    duration: Number, // in seconds
    messageCount: Number,
    userEngagement: {
      type: Number,
      min: 1,
      max: 10
    },
    insightfulMoments: [{
      timestamp: Date,
      description: String,
      impact: {
        type: Number,
        min: 1,
        max: 5
      }
    }]
  },
  
  followUpActions: [{
    type: {
      type: String,
      enum: ['exercise', 'reading', 'reflection', 'practice']
    },
    description: String,
    priority: {
      type: Number,
      min: 1,
      max: 3
    },
    completed: {
      type: Boolean,
      default: false
    },
    dueDate: Date
  }],
  
  status: {
    type: String,
    enum: ['active', 'paused', 'completed'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Add indexes for frequent queries
conversationSchema.index({ user: 1, createdAt: -1 });
conversationSchema.index({ 'messages.timestamp': 1 });
conversationSchema.index({ status: 1 });

// Add text index for search functionality
conversationSchema.index({
  'messages.content': 'text',
  'analysis.dominantThemes': 'text',
  'analysis.psychologicalInsights.description': 'text'
});

module.exports = mongoose.model('Conversation', conversationSchema);
