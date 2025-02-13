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

// Public routes (no authentication required)
router.post('/chat', chatWithAI);

// Protected routes (require authentication)
router.use(authMiddleware);
router.get('/history', getConversationHistory);

// Premium routes (require subscription)
router.use(premiumMiddleware);
router.get('/insights', getAIInsights);

module.exports = router;
