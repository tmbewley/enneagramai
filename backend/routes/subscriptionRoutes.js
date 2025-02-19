const express = require('express');
const router = express.Router();
const {
  createSubscription,
  handleWebhook,
  getSubscriptionStatus,
  cancelSubscription,
} = require('../controllers/subscriptionController');
const { 
  authMiddleware 
} = require('../middleware/errorMiddleware');

// Webhook route (needs raw body for Stripe signature verification)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// All other routes require authentication
router.use(authMiddleware);

router.post('/create', createSubscription);
router.get('/status', getSubscriptionStatus);
router.post('/cancel', cancelSubscription);

module.exports = router;
