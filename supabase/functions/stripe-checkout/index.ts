import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { planName, billingCycle, userEmail, userId } = await req.json();

    // Stripe pricing configuration
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
    const selectedCycle = selectedPlan[billingCycle as keyof typeof selectedPlan];

    // TODO: Integrate with Stripe API
    // const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);
    //
    // const session = await stripe.checkout.sessions.create({
    //   customer_email: userEmail,
    //   payment_method_types: ["card"],
    //   line_items: [{
    //     price: selectedCycle.priceId,
    //     quantity: 1,
    //   }],
    //   mode: "subscription",
    //   success_url: `${req.headers.get("origin")}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${req.headers.get("origin")}/pricing`,
    //   metadata: {
    //     userId,
    //     planName,
    //     billingCycle,
    //   },
    //   subscription_data: {
    //     trial_period_days: 14,
    //   },
    // });

    // For now, return mock checkout URL
    const mockCheckoutUrl = `https://checkout.stripe.com/mock-session?plan=${planName}&cycle=${billingCycle}`;

    return new Response(
      JSON.stringify({
        success: true,
        checkoutUrl: mockCheckoutUrl,
        price: selectedCycle.price,
        planName,
        billingCycle
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
