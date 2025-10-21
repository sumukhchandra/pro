const express = require('express');
const { body, validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Content = require('../models/Content');
const { auth, requirePro } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/payment/create-subscription
// @desc    Create Stripe subscription for Pro tier
// @access  Private
router.post('/create-subscription', auth, [
  body('priceId').notEmpty().withMessage('Price ID is required'),
  body('paymentMethodId').notEmpty().withMessage('Payment method ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { priceId, paymentMethodId } = req.body;

    // Create Stripe customer if doesn't exist
    let customerId = req.user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.username,
        metadata: {
          userId: req.user._id.toString()
        }
      });
      customerId = customer.id;
      
      // Update user with customer ID
      req.user.stripeCustomerId = customerId;
      await req.user.save();
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      expand: ['latest_invoice.payment_intent'],
    });

    // Update user subscription status
    req.user.subscriptionId = subscription.id;
    req.user.subscriptionStatus = subscription.status;
    req.user.userRole = 'pro';
    req.user.subscriptionEndDate = new Date(subscription.current_period_end * 1000);
    await req.user.save();

    res.json({
      message: 'Subscription created successfully',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_end: subscription.current_period_end
      }
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/payment/cancel-subscription
// @desc    Cancel Stripe subscription
// @access  Private
router.post('/cancel-subscription', auth, requirePro, async (req, res) => {
  try {
    if (!req.user.subscriptionId) {
      return res.status(400).json({ message: 'No active subscription found' });
    }

    // Cancel subscription at period end
    const subscription = await stripe.subscriptions.update(req.user.subscriptionId, {
      cancel_at_period_end: true,
    });

    // Update user status
    req.user.subscriptionStatus = 'cancelled';
    await req.user.save();

    res.json({
      message: 'Subscription will be cancelled at the end of the current period',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end
      }
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/payment/purchase-content
// @desc    Purchase premium content
// @access  Private
router.post('/purchase-content', auth, [
  body('contentId').notEmpty().withMessage('Content ID is required'),
  body('paymentMethodId').notEmpty().withMessage('Payment method ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { contentId, paymentMethodId } = req.body;

    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    if (content.monetizationType !== 'premium_to_buy') {
      return res.status(400).json({ message: 'Content is not available for purchase' });
    }

    if (content.authorId.equals(req.user._id)) {
      return res.status(400).json({ message: 'Cannot purchase your own content' });
    }

    if (req.user.hasPurchased(contentId)) {
      return res.status(400).json({ message: 'Content already purchased' });
    }

    // Create Stripe customer if doesn't exist
    let customerId = req.user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.username,
        metadata: {
          userId: req.user._id.toString()
        }
      });
      customerId = customer.id;
      
      req.user.stripeCustomerId = customerId;
      await req.user.save();
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(content.price * 100), // Convert to cents
      currency: 'usd',
      customer: customerId,
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      metadata: {
        userId: req.user._id.toString(),
        contentId: contentId,
        type: 'content_purchase'
      }
    });

    if (paymentIntent.status === 'succeeded') {
      // Add content to user's purchased list
      req.user.addPurchasedContent(contentId);
      await req.user.save();

      res.json({
        message: 'Content purchased successfully',
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status
        }
      });
    } else {
      res.status(400).json({ 
        message: 'Payment failed',
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status
        }
      });
    }
  } catch (error) {
    console.error('Purchase content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/payment/prices
// @desc    Get available subscription prices
// @access  Public
router.get('/prices', async (req, res) => {
  try {
    const prices = await stripe.prices.list({
      active: true,
      type: 'recurring',
      expand: ['data.product']
    });

    res.json(prices.data);
  } catch (error) {
    console.error('Get prices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/payment/setup-intent
// @desc    Create setup intent for saving payment methods
// @access  Private
router.get('/setup-intent', auth, async (req, res) => {
  try {
    // Create Stripe customer if doesn't exist
    let customerId = req.user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.username,
        metadata: {
          userId: req.user._id.toString()
        }
      });
      customerId = customer.id;
      
      req.user.stripeCustomerId = customerId;
      await req.user.save();
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });

    res.json({
      client_secret: setupIntent.client_secret
    });
  } catch (error) {
    console.error('Create setup intent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/payment/payment-methods
// @desc    Get user's saved payment methods
// @access  Private
router.get('/payment-methods', auth, async (req, res) => {
  try {
    if (!req.user.stripeCustomerId) {
      return res.json({ paymentMethods: [] });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: req.user.stripeCustomerId,
      type: 'card',
    });

    res.json({ paymentMethods: paymentMethods.data });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/payment/webhook
// @desc    Handle Stripe webhooks
// @access  Public (but should be secured with webhook secret)
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        await handleSubscriptionUpdate(subscription);
        break;
      
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        await handleSubscriptionDeleted(deletedSubscription);
        break;
      
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await handlePaymentSucceeded(paymentIntent);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Helper functions for webhook handling
async function handleSubscriptionUpdate(subscription) {
  const user = await User.findOne({ subscriptionId: subscription.id });
  if (user) {
    user.subscriptionStatus = subscription.status;
    user.subscriptionEndDate = new Date(subscription.current_period_end * 1000);
    await user.save();
  }
}

async function handleSubscriptionDeleted(subscription) {
  const user = await User.findOne({ subscriptionId: subscription.id });
  if (user) {
    user.subscriptionStatus = 'cancelled';
    user.userRole = 'standard';
    await user.save();
  }
}

async function handlePaymentSucceeded(paymentIntent) {
  if (paymentIntent.metadata.type === 'content_purchase') {
    const user = await User.findById(paymentIntent.metadata.userId);
    if (user) {
      user.addPurchasedContent(paymentIntent.metadata.contentId);
      await user.save();
    }
  }
}

module.exports = router;