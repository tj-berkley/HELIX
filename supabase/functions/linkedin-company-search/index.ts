import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const LINKEDIN_ACCESS_TOKEN = Deno.env.get("LINKEDIN_ACCESS_TOKEN") || "";

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

    if (!LINKEDIN_ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({ error: "LinkedIn access token not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const keywords = location ? `${query} ${location}` : query;
    const params = new URLSearchParams({
      keywords: keywords,
      start: "0",
      count: "20",
    });

    const linkedinResponse = await fetch(
      `https://api.linkedin.com/v2/organizationSearchResults?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
          Accept: "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
      }
    );

    if (!linkedinResponse.ok) {
      const errorData = await linkedinResponse.json();
      return new Response(
        JSON.stringify({
          error: `LinkedIn API error: ${errorData.message || linkedinResponse.statusText}`
        }),
        {
          status: linkedinResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await linkedinResponse.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in linkedin-company-search:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
