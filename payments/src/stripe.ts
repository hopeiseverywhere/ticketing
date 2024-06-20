import Stripe from "stripe";

// create an instance of stripe lib
export const stripe = new Stripe(process.env.STRIPE_KEY!, {
    apiVersion: "2024-04-10",
});
