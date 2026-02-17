import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const FACEBOOK_ACCESS_TOKEN = Deno.env.get("FACEBOOK_ACCESS_TOKEN") || "";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("query");
    const location = url.searchParams.get("location");

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query parameter is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!FACEBOOK_ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({ error: "Facebook access token not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const searchQuery = location ? `${query} ${location}` : query;
    const params = new URLSearchParams({
      q: searchQuery,
      type: "page",
      fields: "id,name,location,phone,website,emails,rating_count,overall_star_rating,category,about",
      access_token: FACEBOOK_ACCESS_TOKEN,
      limit: "20",
    });

    const fbResponse = await fetch(
      `https://graph.facebook.com/v19.0/search?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!fbResponse.ok) {
      const errorData = await fbResponse.json();
      return new Response(
        JSON.stringify({
          error: `Facebook API error: ${errorData.error?.message || fbResponse.statusText}`
        }),
        {
          status: fbResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await fbResponse.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in facebook-business-search:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
