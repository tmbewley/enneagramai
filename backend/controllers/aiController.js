const asyncHandler = require('express-async-handler');
const Conversation = require('../models/conversationModel');
const KnowledgeBase = require('../models/knowledgeBaseModel');
const User = require('../models/userModel');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// @desc    Chat with AI (public or authenticated)
// @route   POST /api/ai/chat
// @access  Public
const chatWithAI = asyncHandler(async (req, res) => {
  const { message, userId } = req.body;

  if (!message) {
    res.status(400);
    throw new Error('Please provide a message');
  }

  let user = null;
  let conversation = null;

  // If userId is provided, get user and conversation context
  if (userId) {
    user = await User.findById(userId);
    conversation = await Conversation.findOne({
      user: userId,
      status: 'active'
    }).sort({ createdAt: -1 });

    if (!conversation) {
      conversation = await Conversation.create({
        user: userId,
        messages: [],
        analysis: {
          dominantThemes: [],
          psychologicalInsights: [],
          personalGrowth: {
            challenges: [],
            strengths: [],
            recommendations: []
          }
        }
      });
    }
  }

  // Prepare conversation context for AI
  const contextMessages = [];

  // Add system message with Enneagram expertise
  contextMessages.push({
    role: 'system',
    content: `You are an AI expert in the Enneagram system, psychology, and personal development. 
    ${user?.enneagramType ? 
      `The user is a Type ${user.enneagramType}${user.enneagramWing ? ` with a ${user.enneagramWing} wing` : ''}.` : 
      'The user has not yet identified their Enneagram type.'}`
  });

  // Add conversation history for authenticated users
  if (conversation) {
    const recentMessages = conversation.messages.slice(-5); // Get last 5 messages
    recentMessages.forEach(msg => {
      contextMessages.push({
        role: msg.role,
        content: msg.content
      });
    });
  }

  // Add current user message
  contextMessages.push({
    role: 'user',
    content: message
  });

  try {
    // Generate AI response using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: contextMessages,
      temperature: 0.7,
      max_tokens: 500
    });

    const aiResponse = completion.choices[0].message.content;
    const responseMetadata = await analyzeResponse(aiResponse);

    // If authenticated, save to conversation history
    if (conversation) {
      // Add user message
      conversation.messages.push({
        role: 'user',
        content: message,
        metadata: {
          emotionalTone: responseMetadata.userTone,
          topics: responseMetadata.topics,
        }
      });

      // Add AI response
      conversation.messages.push({
        role: 'assistant',
        content: aiResponse,
        metadata: {
          emotionalTone: responseMetadata.aiTone,
          topics: responseMetadata.topics,
          enneagramReferences: responseMetadata.enneagramReferences,
          theoriesReferenced: responseMetadata.theoriesReferenced
        }
      });

      // Update conversation analysis
      await updateConversationAnalysis(conversation);
      await conversation.save();

      // Update user's conversation history if needed
      if (user && !user.conversationHistory.includes(conversation._id)) {
        user.conversationHistory.push(conversation._id);
        await user.save();
      }
    }

    res.status(200).json({
      message: aiResponse,
      analysis: responseMetadata
    });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({
      message: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get conversation history
// @route   GET /api/ai/history
// @access  Private
const getConversationHistory = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(req.query.limit ? Number(req.query.limit) : 10);

  res.status(200).json(conversations);
});

// @desc    Get AI insights and recommendations
// @route   GET /api/ai/insights
// @access  Private
const getAIInsights = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const conversations = await Conversation.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(5);

  const insights = await generateInsights(user, conversations);
  
  res.status(200).json(insights);
});

// Helper Functions

// Analyze AI response for metadata
const analyzeResponse = async (response) => {
  try {
    const analysis = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Analyze the following AI response and extract metadata including emotional tone, topics discussed, Enneagram references, and psychological theories referenced. Return the analysis in JSON format."
        },
        {
          role: "user",
          content: response
        }
      ],
      temperature: 0.3,
      max_tokens: 200
    });

    return JSON.parse(analysis.choices[0].message.content);
  } catch (error) {
    console.error('Response analysis error:', error);
    return {
      aiTone: "neutral",
      topics: ["personal development"],
      enneagramReferences: [],
      theoriesReferenced: []
    };
  }
};

// Update conversation analysis based on message history
const updateConversationAnalysis = async (conversation) => {
  try {
    const messages = conversation.messages.map(m => m.content).join('\n');
    const analysis = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Analyze this conversation history and provide insights about dominant themes, psychological patterns, and growth opportunities. Return the analysis in JSON format."
        },
        {
          role: "user",
          content: messages
        }
      ],
      temperature: 0.3,
      max_tokens: 300
    });

    conversation.analysis = JSON.parse(analysis.choices[0].message.content);
  } catch (error) {
    console.error('Conversation analysis error:', error);
    // Fallback to basic analysis if API fails
    conversation.analysis = {
      dominantThemes: ["personal growth"],
      psychologicalInsights: [],
      personalGrowth: {
        challenges: [],
        strengths: [],
        recommendations: []
      }
    };
  }
};

// Generate insights based on user data and conversation history
const generateInsights = async (user, conversations) => {
  try {
    const conversationHistory = conversations.map(c => ({
      messages: c.messages,
      analysis: c.analysis
    }));

    const analysis = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Generate insights and recommendations for a Type ${user.enneagramType} user based on their conversation history. Return the analysis in JSON format.`
        },
        {
          role: "user",
          content: JSON.stringify(conversationHistory)
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    return JSON.parse(analysis.choices[0].message.content);
  } catch (error) {
    console.error('Insights generation error:', error);
    return {
      patterns: [],
      recommendations: [],
      progressMetrics: {
        selfAwareness: 5,
        growthTrend: "neutral",
        keyAreas: []
      }
    };
  }
};

module.exports = {
  chatWithAI,
  getConversationHistory,
  getAIInsights
};
