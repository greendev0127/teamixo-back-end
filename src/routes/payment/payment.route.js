import AWS from "aws-sdk";
import { Router } from "express";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const router = Router();

router.post("/subscription", async (req, res) => {
  const { email, paymentMethodId, number } = req.body;

  try {
    // Create a new customer
    const customer = await stripe.customers.create({
      email: email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create the subscription with 20x quantity
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          plan: process.env.STRIPE_PRICE_ID,
          quantity: number, // Charge for 20 units of the subscription
        },
      ],
      expand: ["latest_invoice.payment_intent"],
    });

    return res.status(200).json({ statusCode: 200, body: subscription });
  } catch (error) {
    return res.status(200).json({
      statusCode: 400,
      body: JSON.stringify({ error: error.message }),
    });
  }
});

router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];

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
    case "customer.subscription.created":
      const subscriptionCreated = event.data.object;
      // Handle the subscription created event
      console.log(
        `Subscription ${subscriptionCreated.id} created for customer ${subscriptionCreated.customer}`
      );
      break;
    case "customer.subscription.updated":
      const subscriptionUpdated = event.data.object;
      // Handle the subscription updated event
      console.log(`Subscription ${subscriptionUpdated.id} updated.`);
      break;
    case "customer.subscription.deleted":
      const subscriptionDeleted = event.data.object;
      // Handle the subscription deleted event
      console.log(`Subscription ${subscriptionDeleted.id} deleted.`);
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
});

export default router;
