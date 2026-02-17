import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@^14.0.0";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, Stripe-Signature",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey || !webhookSecret) {
      return new Response(
        JSON.stringify({ error: "Stripe configuration missing" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Supabase configuration missing" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-12-18.acacia",
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(
        JSON.stringify({ error: `Webhook Error: ${err.message}` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Received event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(supabase, session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(supabase, paymentIntent);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(supabase, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(supabase, invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(supabase, invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true, eventType: event.type }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Webhook handler error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Webhook processing failed",
        details: error.toString(),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

async function handleCheckoutCompleted(supabase: any, session: Stripe.Checkout.Session) {
  console.log("Processing checkout.session.completed");

  const userId = session.metadata?.userId;
  const planName = session.metadata?.planName;
  const billingCycle = session.metadata?.billingCycle;

  if (!userId || !planName || !billingCycle) {
    console.error("Missing metadata in checkout session");
    return;
  }

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  const pricing = {
    starter: { monthly: 97, annual: 970 },
    professional: { monthly: 197, annual: 1970 },
    enterprise: { monthly: 497, annual: 4970 },
  };

  const price = pricing[planName as keyof typeof pricing]?.[billingCycle as keyof typeof pricing.starter];

  if (!price) {
    console.error("Invalid plan or billing cycle");
    return;
  }

  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 3);

  const { error } = await supabase
    .from("subscriptions")
    .upsert({
      user_id: userId,
      plan_name: planName,
      status: "trial",
      billing_cycle: billingCycle,
      price: price,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      trial_end_date: trialEndDate.toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id",
    });

  if (error) {
    console.error("Error creating subscription:", error);
  } else {
    console.log("Subscription created successfully");
  }
}

async function handleSubscriptionUpdate(supabase: any, subscription: Stripe.Subscription) {
  console.log("Processing subscription update");

  const customerId = subscription.customer as string;

  const { data: existingSubscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!existingSubscription) {
    console.error("Subscription not found for customer:", customerId);
    return;
  }

  let status = "active";
  if (subscription.status === "trialing") status = "trial";
  else if (subscription.status === "canceled") status = "cancelled";
  else if (subscription.status === "past_due") status = "past_due";
  else if (subscription.status === "unpaid") status = "expired";

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancelled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("Error updating subscription:", error);
  } else {
    console.log("Subscription updated successfully");
  }
}

async function handleSubscriptionDeleted(supabase: any, subscription: Stripe.Subscription) {
  console.log("Processing subscription deletion");

  const customerId = subscription.customer as string;

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("Error cancelling subscription:", error);
  } else {
    console.log("Subscription cancelled successfully");
  }
}

async function handleInvoicePaymentSucceeded(supabase: any, invoice: Stripe.Invoice) {
  console.log("Processing invoice payment succeeded");

  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    console.log("Invoice not related to subscription");
    return;
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("Error updating subscription status:", error);
  } else {
    console.log("Subscription status updated to active");
  }
}

async function handleInvoicePaymentFailed(supabase: any, invoice: Stripe.Invoice) {
  console.log("Processing invoice payment failed");

  const customerId = invoice.customer as string;

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("Error updating subscription status:", error);
  } else {
    console.log("Subscription status updated to past_due");
  }
}

async function handlePaymentIntentSucceeded(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  console.log("Processing payment_intent.succeeded for credit purchase");

  const metadata = paymentIntent.metadata;
  const userId = metadata?.userId;
  const credits = metadata?.credits;
  const packageId = metadata?.packageId;

  // Check if this is a credit purchase
  if (metadata?.type !== "credit_purchase" || !userId || !credits) {
    console.log("Not a credit purchase, skipping");
    return;
  }

  console.log(`Adding ${credits} credits to user ${userId}`);

  // Call the database function to add credits
  const { data, error } = await supabase.rpc("add_credits_to_balance", {
    p_user_id: userId,
    p_amount: parseFloat(credits),
    p_description: `Purchased ${credits} credits`,
    p_stripe_payment_intent_id: paymentIntent.id,
  });

  if (error) {
    console.error("Error adding credits to balance:", error);
  } else {
    console.log("Credits added successfully:", data);
  }
}
