import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const renderCheckout = async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1999, // $19.99
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    res.render("checkout", {
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating payment");
  }
};

export const paymentSuccess = (req, res) => {
  res.render("payment-success");
};

