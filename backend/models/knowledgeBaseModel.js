const mongoose = require('mongoose');

const knowledgeBaseSchema = mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['enneagram', 'gurdjieff', 'neuroscience', 'consciousness', 'synthesis']
  },
  
  // For Enneagram content
  enneagramType: {
    type: Number,
    min: 1,
    max: 9,
    required: function() { return this.category === 'enneagram'; }
  },
  
  title: {
    type: String,
    required: true
  },
  
  content: {
    type: String,
    required: true
  },
  
  metadata: {
    // For Enneagram types
    basicFear: String,
    basicDesire: String,
    keyMotivations: [String],
    
    // For levels of health
    healthLevels: [{
      level: {
        type: Number,
        min: 1,
        max: 9
      },
      description: String,
      characteristics: [String],
      warning_signs: [String]
    }],
    
    // For wings
    wings: [{
      number: Number,
      description: String,
      characteristics: [String]
    }],
    
    // For triads
    triad: {
      name: String, // heart, head, or gut
      characteristics: [String],
      coreEmotions: [String]
    },
    
    // For Gurdjieff teachings
    centers: {
      moving: String,
      emotional: String,
      intellectual: String
    },
    
    // For neuroscience content
    brainRegions: [String],
    neurotransmitters: [String],
    researchReferences: [String],
    
    // For consciousness theories
    theorists: [String],
    keyPrinciples: [String],
    practicalApplications: [String]
  },
  
  relationships: [{
    relatedType: {
      type: String,
      enum: ['enneagram', 'gurdjieff', 'neuroscience', 'consciousness']
    },
    relationshipType: {
      type: String,
      enum: ['supports', 'contradicts', 'extends', 'explains']
    },
    description: String,
    strength: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  
  exercises: [{
    title: String,
    description: String,
    duration: String,
    difficulty: {
      type: Number,
      min: 1,
      max: 5
    },
    benefits: [String],
    contraindications: [String],
    steps: [String]
  }],
  
  sources: [{
    author: String,
    title: String,
    year: Number,
    url: String,
    type: {
      type: String,
      enum: ['book', 'article', 'research', 'interview', 'other']
    }
  }],
  
  tags: [String],
  
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Add compound index for category and enneagramType
knowledgeBaseSchema.index({ category: 1, enneagramType: 1 });

// Add text index for full-text search
knowledgeBaseSchema.index({
  title: 'text',
  content: 'text',
  'metadata.keyMotivations': 'text',
  'metadata.characteristics': 'text'
});

module.exports = mongoose.model('KnowledgeBase', knowledgeBaseSchema);
