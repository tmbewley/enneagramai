const asyncHandler = require('express-async-handler');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/userModel');

// @desc    Create subscription
// @route   POST /api/subscription/create
// @access  Private
const createSubscription = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  try {
    // Create or get Stripe customer
    let customer;
    if (user.stripeCustomerId) {
      customer = await stripe.customers.retrieve(user.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString()
        }
      });
      user.stripeCustomerId = customer.id;
      await user.save();
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env.STRIPE_PRICE_ID }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (error) {
    res.status(400);
    throw new Error('Error creating subscription: ' + error.message);
  }
});

// @desc    Handle subscription webhook
// @route   POST /api/subscription/webhook
// @access  Public
const handleWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      await updateSubscriptionStatus(subscription);
      break;
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      await handleCancelledSubscription(deletedSubscription);
      break;
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      await handleFailedPayment(failedInvoice);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// @desc    Get subscription status
// @route   GET /api/subscription/status
// @access  Private
const getSubscriptionStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!user.stripeCustomerId) {
    return res.json({ status: 'inactive' });
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
      limit: 1,
    });

    const status = subscriptions.data.length > 0 ? 'active' : 'inactive';
    res.json({
      status,
      subscription: subscriptions.data[0] || null,
    });
  } catch (error) {
    res.status(400);
    throw new Error('Error fetching subscription status: ' + error.message);
  }
});

// @desc    Cancel subscription
// @route   POST /api/subscription/cancel
// @access  Private
const cancelSubscription = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      res.status(400);
      throw new Error('No active subscription found');
    }

    const subscription = await stripe.subscriptions.update(
      subscriptions.data[0].id,
      { cancel_at_period_end: true }
    );

    res.json({
      message: 'Subscription will be cancelled at the end of the billing period',
      subscription,
    });
  } catch (error) {
    res.status(400);
    throw new Error('Error cancelling subscription: ' + error.message);
  }
});

// Helper Functions

const updateSubscriptionStatus = async (subscription) => {
  const user = await User.findOne({
    stripeCustomerId: subscription.customer,
  });

  if (!user) return;

  user.subscriptionStatus = subscription.status;
  user.isPremium = subscription.status === 'active';
  await user.save();
};

const handleCancelledSubscription = async (subscription) => {
  const user = await User.findOne({
    stripeCustomerId: subscription.customer,
  });

  if (!user) return;

  user.subscriptionStatus = 'cancelled';
  user.isPremium = false;
  await user.save();
};

const handleFailedPayment = async (invoice) => {
  const user = await User.findOne({
    stripeCustomerId: invoice.customer,
  });

  if (!user) return;

  // You might want to notify the user or take other actions
  console.log(`Payment failed for user ${user.email}`);
};

module.exports = {
  createSubscription,
  handleWebhook,
  getSubscriptionStatus,
  cancelSubscription,
};
