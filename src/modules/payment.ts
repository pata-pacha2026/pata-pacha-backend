import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../config/database';

export const paymentRouter = Router();

// Stripe: Create Payment Intent
paymentRouter.post('/stripe/create-intent', async (req: Request, res: Response) => {
  const { amount, currency = 'usd', metadata } = req.body;

  if (!amount || amount <= 0) {
    res.status(400).json({ success: false, error: 'Valid amount is required' });
    return;
  }

  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      // Demo mode: return a simulated client secret
      res.json({
        success: true,
        data: {
          clientSecret: `pi_demo_${Date.now()}_secret_demo`,
          demoMode: true,
        },
      });
      return;
    }

    const stripe = new Stripe(stripeKey);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: metadata || {},
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      success: true,
      data: { clientSecret: paymentIntent.client_secret },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Stripe payment failed' });
  }
});

// Stripe: Confirm Payment
paymentRouter.post('/stripe/confirm', async (req: Request, res: Response) => {
  const { paymentIntentId, orderId } = req.body;

  try {
    if (orderId) {
      await prisma.order.update({
        where: { id: Number(orderId) },
        data: { status: 'paid' },
      });
    }

    res.json({ success: true, data: { status: 'paid' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PayPal: Create Order
paymentRouter.post('/paypal/create-order', async (req: Request, res: Response) => {
  const { amount, currency = 'USD', orderId } = req.body;

  if (!amount || amount <= 0) {
    res.status(400).json({ success: false, error: 'Valid amount is required' });
    return;
  }

  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      // Demo mode
      res.json({
        success: true,
        data: {
          orderID: `PAYPAL_DEMO_${Date.now()}`,
          demoMode: true,
        },
      });
      return;
    }

    // Use PayPal SDK to create order
    const paypal = require('@paypal/checkout-server-sdk');
    const environment = process.env.PAYPAL_MODE === 'live'
      ? new paypal.core.LiveEnvironment(clientId, clientSecret)
      : new paypal.core.SandboxEnvironment(clientId, clientSecret);
    const client = new paypal.core.PayPalHttpClient(environment);

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { currency_code: currency, value: String(amount) },
        reference_id: String(orderId || ''),
      }],
    });

    const order = await client.execute(request);
    res.json({ success: true, data: { orderID: order.result.id } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'PayPal order creation failed' });
  }
});

// PayPal: Capture Order
paymentRouter.post('/paypal/capture-order', async (req: Request, res: Response) => {
  const { paypalOrderId, orderId } = req.body;

  try {
    if (orderId) {
      await prisma.order.update({
        where: { id: Number(orderId) },
        data: { status: 'paid' },
      });
    }

    res.json({ success: true, data: { status: 'paid' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get available payment methods based on env config
paymentRouter.post('/methods', async (_req: Request, res: Response) => {
  const methods: string[] = [];

  if (process.env.STRIPE_SECRET_KEY) {
    methods.push('card', 'alipay', 'wechat_pay');
  } else {
    methods.push('card_demo'); // Demo mode still shows card
  }

  if (process.env.PAYPAL_CLIENT_ID) {
    methods.push('paypal');
  } else {
    methods.push('paypal_demo');
  }

  res.json({ success: true, data: methods });
});
