import AWS from "aws-sdk";
import { Router } from "express";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const stripe = require("stripe")(process.env.STRIPE_S_ID);

const router = Router();

router.post("/subscription", async (req, res) => {
  const { email, paymentMethodId, number } = req.body;
  const data = req.body;
  console.log(email, paymentMethodId, number);

  try {
    const timeStamp = new Date().getTime();
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

    console.log(subscription.id, subscription.customer, subscription.quantity);

    const paymentInfo = {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      quantity: subscription.quantity,
    };

    const updatePlanParams = {
      TableName: "company_list",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#paymentInfo": "paymentInfo",
        "#state": "state",
      },
      ExpressionAttributeValues: {
        ":paymentInfo": paymentInfo,
        ":state": "paid",
        ":updateAt": timeStamp,
      },
      UpdateExpression:
        "SET #paymentInfo = :paymentInfo, #state = :state, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    const result = await dynamoDb.update(updatePlanParams).promise();

    return res.status(200).json({ statusCode: 200, body: subscription });
  } catch (error) {
    console.log("err", error);
    return res.status(200).json({
      statusCode: 400,
      body: { error: error },
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
