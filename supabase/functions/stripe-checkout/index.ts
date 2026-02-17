import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@^14.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { planName, billingCycle, userEmail, userId } = await req.json();

    if (!planName || !billingCycle || !userEmail || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: planName, billingCycle, userEmail, userId" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: "Stripe not configured. Please add STRIPE_SECRET_KEY to Supabase secrets." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-12-18.acacia",
    });

    const pricing = {
      starter: {
        monthly: { price: 97, priceId: "price_starter_monthly" },
        annual: { price: 970, priceId: "price_starter_annual" }
      },
      professional: {
        monthly: { price: 197, priceId: "price_professional_monthly" },
        annual: { price: 1970, priceId: "price_professional_annual" }
      },
      enterprise: {
        monthly: { price: 497, priceId: "price_enterprise_monthly" },
        annual: { price: 4970, priceId: "price_enterprise_annual" }
      }
    };

    const selectedPlan = pricing[planName as keyof typeof pricing];
    if (!selectedPlan) {
      return new Response(
        JSON.stringify({ error: `Invalid plan name: ${planName}` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const selectedCycle = selectedPlan[billingCycle as keyof typeof selectedPlan];
    if (!selectedCycle) {
      return new Response(
        JSON.stringify({ error: `Invalid billing cycle: ${billingCycle}` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const origin = req.headers.get("origin") || "https://yourdomain.com";

    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      payment_method_types: ["card"],
      line_items: [{
        price: selectedCycle.priceId,
        quantity: 1,
      }],
      mode: "subscription",
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${origin}/?cancelled=true`,
      metadata: {
        userId,
        planName,
        billingCycle,
      },
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          userId,
          planName,
          billingCycle,
        },
      },
      allow_promotion_codes: true,
    });

    return new Response(
      JSON.stringify({
        success: true,
        checkoutUrl: session.url,
        sessionId: session.id,
        price: selectedCycle.price,
        planName,
        billingCycle,
        trialDays: 7,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to create checkout session",
        details: error.toString()
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
