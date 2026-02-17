import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@^14.0.0";
import { createClient } from "npm:@supabase/supabase-js@^2.39.0";

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
    const { packageId, userId, userEmail } = await req.json();

    if (!packageId || !userId || !userEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: packageId, userId, userEmail" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey || !supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Service not configured properly" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-06-30.basil",
    });

    // Fetch the credit package details
    const { data: packageData, error: packageError } = await supabase
      .from("credit_packages")
      .select("*")
      .eq("id", packageId)
      .eq("active", true)
      .maybeSingle();

    if (packageError || !packageData) {
      return new Response(
        JSON.stringify({ error: "Invalid or inactive credit package" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const origin = req.headers.get("origin") || "https://yourdomain.com";

    // Create Stripe Checkout Session for one-time payment
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: packageData.name,
            description: packageData.description || `${packageData.credits} platform credits`,
            images: [],
          },
          unit_amount: Math.round(packageData.sale_price * 100), // Convert to cents
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${origin}/dashboard?credits_purchase=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?credits_purchase=cancelled`,
      metadata: {
        userId,
        packageId,
        credits: packageData.credits.toString(),
        type: "credit_purchase",
      },
      payment_intent_data: {
        metadata: {
          userId,
          packageId,
          credits: packageData.credits.toString(),
          type: "credit_purchase",
        },
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        checkoutUrl: session.url,
        sessionId: session.id,
        package: {
          name: packageData.name,
          credits: packageData.credits,
          price: packageData.sale_price,
        },
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Purchase credits error:", error);
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
