const asyncHandler = require('express-async-handler');
const Conversation = require('../models/conversationModel');
const KnowledgeBase = require('../models/knowledgeBaseModel');
const User = require('../models/userModel');
const axios = require('axios');

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

  try {
    // Prepare system context
    const systemMessage = user?.enneagramType 
      ? `You are an AI expert in the Enneagram system. The user is a Type ${user.enneagramType}${user.enneagramWing ? ` with a ${user.enneagramWing} wing` : ''}.`
      : 'You are an AI expert in the Enneagram system, psychology, and personal development.';

    // Prepare messages array
    const messages = [
      { role: 'system', content: systemMessage }
    ];

    // Add conversation history if available
    if (conversation) {
      const recentMessages = conversation.messages.slice(-5);
      messages.push(...recentMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      })));
    }

    // Add current user message
    messages.push({ role: 'user', content: message });

    // Call xAI Grok API
    const response = await axios.post(process.env.XAI_API_URL, {
      model: "grok-2-latest",
      messages: messages,
      stream: false,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const aiResponse = response.data.choices[0].message.content;

    // If authenticated, save to conversation history
    if (conversation) {
      // Add user message
      conversation.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });

      // Add AI response
      conversation.messages.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
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
      message: aiResponse
    });
  } catch (error) {
    console.error('xAI Grok API Error:', error);
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
  const limit = Number(req.query.limit) || 20;
  const cursor = req.query.cursor; // timestamp of the oldest message
  
  let query = { user: req.user.id };
  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }

  const conversations = await Conversation.find(query)
    .sort({ createdAt: -1 })
    .limit(limit + 1); // Get one extra to check if there are more

  const hasMore = conversations.length > limit;
  const results = hasMore ? conversations.slice(0, -1) : conversations;
  
  res.status(200).json({
    conversations: results,
    hasMore,
    nextCursor: hasMore ? results[results.length - 1].createdAt.toISOString() : null
  });
});

// @desc    Get AI insights and recommendations
// @route   GET /api/ai/insights
// @access  Private
const getAIInsights = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const conversations = await Conversation.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(5);

  try {
    const response = await axios.post(process.env.XAI_API_URL, {
      model: "grok-2-latest",
      messages: [
        {
          role: "system",
          content: `Analyze the conversation history for a Type ${user.enneagramType} user and generate insights and recommendations. Return the analysis in JSON format.`
        },
        {
          role: "user",
          content: JSON.stringify(conversations.map(c => c.messages))
        }
      ],
      stream: false,
      temperature: 0.3
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const insights = JSON.parse(response.data.choices[0].message.content);
    res.status(200).json(insights);
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({
      message: "Failed to generate insights",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Helper Functions

// Update conversation analysis based on message history
const updateConversationAnalysis = async (conversation) => {
  try {
    const response = await axios.post(process.env.XAI_API_URL, {
      model: "grok-2-latest",
      messages: [
        {
          role: "system",
          content: "Analyze this conversation history and provide insights about dominant themes, psychological patterns, and growth opportunities. Return the analysis in JSON format."
        },
        {
          role: "user",
          content: JSON.stringify(conversation.messages)
        }
      ],
      stream: false,
      temperature: 0.3
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    conversation.analysis = JSON.parse(response.data.choices[0].message.content);
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

module.exports = {
  chatWithAI,
  getConversationHistory,
  getAIInsights
};
