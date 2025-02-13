const express = require('express');
const router = express.Router();
const {
  chatWithAI,
  getConversationHistory,
  getAIInsights,
} = require('../controllers/aiController');
const { 
  authMiddleware, 
  premiumMiddleware 
} = require('../middleware/errorMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Basic routes (available to all authenticated users)
router.post('/chat', chatWithAI);
router.get('/history', getConversationHistory);

// Premium routes (require subscription)
router.use(premiumMiddleware); // Apply premium middleware to all routes below
router.get('/insights', getAIInsights);

module.exports = router;
